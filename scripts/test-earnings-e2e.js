import fs from 'fs';
import jwt from '../api/node_modules/jsonwebtoken/index.js';

console.log('====================================================');
console.log('RUNNING COMPLETE TIME TRACKING & EARNINGS E2E TEST');
console.log('====================================================\n');

const envContent = fs.readFileSync('api/.env', 'utf8');
const jwtSecret = envContent.match(/JWT_SECRET\s*=\s*(.+)/)[1].trim();

const BASE_URL = 'http://localhost:8000';

let totalTests = 0;
let passedTests = 0;

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
    if (details) {
      console.error(`   Details:`, typeof details === 'object' ? JSON.stringify(details, null, 2) : details);
    }
  }
}

async function api(path, { method = 'GET', token, body, params } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const q = new URLSearchParams(params).toString();
    url += `?${q}`;
  }
  const headers = {
    'Content-Type': 'application/json',
    'x-locale': 'en',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {}
  return { status: res.status, data };
}

async function run() {
  try {
    console.log('--- Step 0: Setting up test users, company, team & project ---');

    // Admin (User 2) and Member (User 3)
    const adminToken = jwt.sign({ id: 2 }, jwtSecret, { expiresIn: '24h' });
    const memberToken = jwt.sign({ id: 3 }, jwtSecret, { expiresIn: '24h' });

    // 1. Create Company with Admin
    const compRes = await api('/api/companies', {
      method: 'POST',
      token: adminToken,
      body: { name: `Earnings Corp ${Date.now()}` },
    });
    assert('Admin creates company', compRes.status === 201 && compRes.data?.data?.id, compRes.data);
    const companyId = compRes.data?.data?.id;

    if (!companyId) {
      console.error('Cannot proceed without companyId');
      process.exit(1);
    }

    // 2. Create Team
    const teamRes = await api('/api/teams', {
      method: 'POST',
      token: adminToken,
      body: { name: `Earnings Team ${Date.now()}`, companyId },
    });
    assert('Admin creates team', (teamRes.status === 200 || teamRes.status === 201) && teamRes.data?.data?.id, teamRes.data);
    const teamId = teamRes.data?.data?.id;

    // 3. Add Member (User 3) to Company as standard MEMBER
    const addMemRes = await api(`/api/companies/${companyId}/member`, {
      method: 'POST',
      token: adminToken,
      body: { phoneNumber: '09122222222' },
    });
    assert('Admin adds Member (User 3) to company as MEMBER', addMemRes.status === 200 && addMemRes.data?.success, addMemRes.data);

    // Add Member to team
    await api(`/api/teams/${teamId}/member`, {
      method: 'POST',
      token: adminToken,
      body: { phoneNumber: '09122222222' },
    });

    // 4. Create Project
    const projRes = await api('/api/projects', {
      method: 'POST',
      token: adminToken,
      body: {
        name: `Time Billing Project ${Date.now()}`,
        companyId,
        teamId,
      },
    });
    assert('Admin creates project', projRes.status === 201 && projRes.data?.data?.id, projRes.data);
    const projectId = projRes.data?.data?.id;

    // ── Test 1: Admin sets project hourly rate ──────────────────────────────
    console.log('\n--- Step 1: Admin setting hourly pay rate ---');
    const setRateRes = await api(`/api/time-entries/project/${projectId}/rate`, {
      method: 'PATCH',
      token: adminToken,
      body: { hourlyRateCents: 5000, currency: 'USD' }, // $50.00 / hr
    });
    assert(
      'Admin can set project hourly rate ($50.00 / 5000 cents)',
      setRateRes.status === 200 && setRateRes.data?.data?.hourlyRateCents === 5000,
      setRateRes.data
    );

    // ── Test 2: Member cannot set/override project rate ──────────────────────
    console.log('\n--- Step 2: Regular member attempt to override rate ---');
    const memberOverrideRes = await api(`/api/time-entries/project/${projectId}/rate`, {
      method: 'PATCH',
      token: memberToken,
      body: { hourlyRateCents: 99999 },
    });
    assert(
      'Regular member forbidden (403) from setting or changing project rate',
      memberOverrideRes.status === 403,
      memberOverrideRes.data
    );

    // ── Test 3: Log time entry under initial rate ($50/hr) ───────────────────
    console.log('\n--- Step 3: Logging time entry with rate snapshotting ---');
    // 120 minutes @ 5000 cents/hr ($50/hr) = 2.0 hrs * 5000 = 10000 cents ($100.00)
    const logRes1 = await api('/api/time-entries', {
      method: 'POST',
      token: adminToken,
      body: {
        projectId,
        duration: 120, // 2 hours
        date: new Date().toISOString(),
        description: 'Development Phase 1',
      },
    });
    assert(
      'Time entry 1 logged with snapshotted rate (5000) and earnings (10000 cents / $100.00)',
      logRes1.status === 201 &&
        logRes1.data?.data?.rateSnapshotCents === 5000 &&
        logRes1.data?.data?.earningsCents === 10000,
      logRes1.data
    );
    const entryId1 = logRes1.data?.data?.id;

    // ── Test 4: Rate change does NOT alter past entries (Historical Snapshot) ─
    console.log('\n--- Step 4: Admin updates project rate to $80/hr (8000 cents) ---');
    const updateRateRes = await api(`/api/time-entries/project/${projectId}/rate`, {
      method: 'PATCH',
      token: adminToken,
      body: { hourlyRateCents: 8000 },
    });
    assert(
      'Admin successfully updates project rate to 8000 cents ($80.00/hr)',
      updateRateRes.status === 200 && updateRateRes.data?.data?.hourlyRateCents === 8000,
      updateRateRes.data
    );

    // Fetch the previously logged entry to verify it was NOT mutated retroactively
    const pastEntryRes = await api(`/api/time-entries/${entryId1}`, { token: adminToken });
    assert(
      'Historical rate preservation: past entry rate snapshot remains 5000 and earnings remain 10000',
      pastEntryRes.status === 200 &&
        pastEntryRes.data?.data?.rateSnapshotCents === 5000 &&
        pastEntryRes.data?.data?.earningsCents === 10000,
      pastEntryRes.data
    );

    // ── Test 5: Log new entry under the new rate ($80/hr) ────────────────────
    console.log('\n--- Step 5: Logging time entry after rate change ---');
    // 60 minutes @ 8000 cents/hr ($80/hr) = 1.0 hr * 8000 = 8000 cents ($80.00)
    const logRes2 = await api('/api/time-entries', {
      method: 'POST',
      token: adminToken,
      body: {
        projectId,
        duration: 60, // 1 hour
        date: new Date().toISOString(),
        description: 'Development Phase 2 under new rate',
      },
    });
    assert(
      'New time entry 2 logged with new rate snapshot (8000) and earnings (8000 cents / $80.00)',
      logRes2.status === 201 &&
        logRes2.data?.data?.rateSnapshotCents === 8000 &&
        logRes2.data?.data?.earningsCents === 8000,
      logRes2.data
    );

    // ── Test 6: Updating time entry duration updates earnings proportionally ─
    console.log('\n--- Step 6: Updating time entry duration ---');
    // Increase entry 1 duration from 120 mins to 180 mins (3 hrs @ frozen 5000 rate = 15000 cents)
    const updateEntryRes = await api(`/api/time-entries/${entryId1}`, {
      method: 'PATCH',
      token: adminToken,
      body: { duration: 180 },
    });
    assert(
      'Editing duration to 180 mins recalculates earnings to 15000 cents using frozen rate snapshot',
      updateEntryRes.status === 200 &&
        updateEntryRes.data?.data?.duration === 180 &&
        updateEntryRes.data?.data?.earningsCents === 15000,
      updateEntryRes.data
    );

    // ── Test 7: Self-scoped protected earnings summary ───────────────────────
    console.log('\n--- Step 7: Self-scoped earnings summary ---');
    // Total for this project: entry 1 (180 mins, 15000 cents) + entry 2 (60 mins, 8000 cents) = 240 mins, 23000 cents
    const earningsRes = await api('/api/time-entries/my/earnings', { token: adminToken });
    const thisProjSummary = earningsRes.data?.data?.byProject?.find((p) => p.projectId === projectId);
    assert(
      'Protected profile earnings returns accurate totals for project (240 mins / 4.0 hrs, 23000 cents)',
      earningsRes.status === 200 &&
        thisProjSummary &&
        thisProjSummary.totalMinutes === 240 &&
        thisProjSummary.totalHours === 4 &&
        thisProjSummary.totalEarningsCents === 23000,
      earningsRes.data
    );

    // Filter by projectId and today
    const today = new Date().toISOString().split('T')[0];
    const filteredEarnings = await api('/api/time-entries/my/earnings', {
      token: adminToken,
      params: { projectId, startDate: today, endDate: today },
    });
    assert(
      'Date & project-filtered earnings summary returns correct entries for today',
      filteredEarnings.status === 200 &&
        filteredEarnings.data?.data?.totalMinutes === 240 &&
        filteredEarnings.data?.data?.totalEarningsCents === 23000,
      filteredEarnings.data
    );

    // Date filter in the past should return 0 entries
    const pastEarnings = await api('/api/time-entries/my/earnings', {
      token: adminToken,
      params: { startDate: '2020-01-01', endDate: '2020-01-02' },
    });
    assert(
      'Date filter for empty past date range returns 0 minutes and 0 count',
      pastEarnings.status === 200 && pastEarnings.data?.data?.entryCount === 0,
      pastEarnings.data
    );

    // ── Test 8: Authorization gap checks ─────────────────────────────────
    console.log('\n--- Step 8: Authorization gap checks ---');
    // Member attempts to request Admin's time entries globally with userId=2
    const crossUserRes = await api('/api/time-entries', {
      token: memberToken,
      params: { userId: 2 },
    });
    assert(
      'Cross-user global time entry query is blocked with 403 Forbidden',
      crossUserRes.status === 403,
      crossUserRes.data
    );

    // Member querying project time entries cannot see Admin's pay rate or earnings
    const projectEntriesRes = await api('/api/time-entries', {
      token: memberToken,
      params: { projectId },
    });
    assert(
      'Project entries fetched by non-admin member sanitize rateSnapshotCents & earningsCents to null',
      projectEntriesRes.status === 200 &&
        projectEntriesRes.data?.data?.length > 0 &&
        projectEntriesRes.data?.data?.every(
          (entry) =>
            entry.userId !== 3
              ? entry.rateSnapshotCents === null && entry.earningsCents === null
              : true
        ),
      projectEntriesRes.data
    );

    // ── Test 9: Admin Project Earnings Report ─────────────────────────────────
    console.log('\n--- Step 9: Admin-only project earnings report ---');
    const adminReportRes = await api(`/api/time-entries/project/${projectId}/earnings`, {
      token: adminToken,
    });
    assert(
      'Admin can fetch project earnings report with full member breakdown',
      adminReportRes.status === 200 &&
        adminReportRes.data?.data?.totalMinutes === 240 &&
        adminReportRes.data?.data?.totalEarningsCents === 23000 &&
        adminReportRes.data?.data?.byMember?.length >= 1,
      adminReportRes.data
    );

    // Regular member attempt to fetch project earnings report
    const memberReportRes = await api(`/api/time-entries/project/${projectId}/earnings`, {
      token: memberToken,
    });
    assert(
      'Regular member forbidden (403) from accessing team earnings report',
      memberReportRes.status === 403,
      memberReportRes.data
    );

    console.log('\n--- Step 10: Per-member custom rate overrides ---');

    // 10.1 Regular member cannot set member rate
    const memberSetRateFail = await api(`/api/time-entries/project/${projectId}/member-rates/3`, {
      method: 'PUT',
      token: memberToken,
      body: { hourlyRateCents: 12000 },
    });
    assert(
      'Regular member forbidden (403) from setting member custom rate',
      memberSetRateFail.status === 403,
      memberSetRateFail.data
    );

    // 10.2 Company owner sets custom rate for Member (User 3) to $120.00 (12000 cents)
    const setMemberRateRes = await api(`/api/time-entries/project/${projectId}/member-rates/3`, {
      method: 'PUT',
      token: adminToken,
      body: { hourlyRateCents: 12000 },
    });
    assert(
      'Company owner sets member custom rate to $120.00 (12000 cents)',
      setMemberRateRes.status === 200 && setMemberRateRes.data?.data?.customHourlyRateCents === 12000,
      setMemberRateRes.data
    );

    // 10.3 Fetch member rates list
    const memberRatesList = await api(`/api/time-entries/project/${projectId}/member-rates`, {
      token: adminToken,
    });
    const targetMember = memberRatesList.data?.data?.members?.find((m) => m.userId === 3);
    assert(
      'Member rates list includes Member 3 with custom rate 12000',
      memberRatesList.status === 200 && targetMember?.hasCustomRate === true && targetMember?.effectiveHourlyRateCents === 12000,
      memberRatesList.data
    );

    // 10.4 Member logs time — should snapshot custom rate 12000 instead of project default 8000
    const customRateEntry = await api('/api/time-entries', {
      method: 'POST',
      token: memberToken,
      body: {
        projectId,
        duration: 60,
        description: 'Work with custom member rate',
      },
    });
    assert(
      'Time entry snapshots member custom rate (12000 cents) instead of project default (8000 cents)',
      customRateEntry.status === 201 &&
        customRateEntry.data?.data?.rateSnapshotCents === 12000 &&
        customRateEntry.data?.data?.earningsCents === 12000,
      customRateEntry.data
    );

    // 10.5 Delete / reset member custom rate reverts to project default rate
    const deleteMemberRateRes = await api(`/api/time-entries/project/${projectId}/member-rates/3`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert(
      'Removing member custom rate reverts member to project default rate',
      deleteMemberRateRes.status === 200 && deleteMemberRateRes.data?.data?.hasCustomRate === false,
      deleteMemberRateRes.data
    );

    console.log('\n--- Step 11: Project creator authorization ---');
    // Member (User 3) creates their own project in company (promote User 3 to ADMIN in company first to allow project creation)
    await api(`/api/companies/${companyId}/member/role`, {
      method: 'PUT',
      token: adminToken,
      body: { memberId: 3, role: 'ADMIN' },
    });

    const user3ProjectRes = await api('/api/projects', {
      method: 'POST',
      token: memberToken,
      body: {
        name: `User3 Project ${Date.now()}`,
        companyId,
        teamId,
      },
    });
    const user3ProjectId = user3ProjectRes.data?.data?.id;
    assert(
      'Project creator creates their project with creatorId recorded',
      user3ProjectRes.status === 201 && Boolean(user3ProjectId),
      user3ProjectRes.data
    );

    // User 3 (project creator) CAN choose/set rate on their own project
    const creatorSetRateRes = await api(`/api/time-entries/project/${user3ProjectId}/rate`, {
      method: 'PATCH',
      token: memberToken,
      body: { hourlyRateCents: 9500 },
    });
    assert(
      'Project creator CAN set hourly rate on their created project ($95.00 / 9500 cents)',
      creatorSetRateRes.status === 200 && creatorSetRateRes.data?.data?.hourlyRateCents === 9500,
      creatorSetRateRes.data
    );

    // User 3 (project creator) CAN set custom member rate on their own project
    const creatorSetMemberRateRes = await api(`/api/time-entries/project/${user3ProjectId}/member-rates/2`, {
      method: 'PUT',
      token: memberToken,
      body: { hourlyRateCents: 11000 },
    });
    assert(
      'Project creator CAN set member custom rate on their created project',
      creatorSetMemberRateRes.status === 200 && creatorSetMemberRateRes.data?.data?.customHourlyRateCents === 11000,
      creatorSetMemberRateRes.data
    );

    // User 3 is now company ADMIN, but is NOT the company owner and NOT creator of project 1.
    // User 3 MUST be forbidden (403) from setting the rate on project 1.
    const nonCreatorAdminSetRateFail = await api(`/api/time-entries/project/${projectId}/rate`, {
      method: 'PATCH',
      token: memberToken,
      body: { hourlyRateCents: 9999 },
    });
    assert(
      'Company ADMIN who is not company owner and not project creator is forbidden (403) from setting rate',
      nonCreatorAdminSetRateFail.status === 403,
      nonCreatorAdminSetRateFail.data
    );

    console.log('\n====================================================');
    console.log(`TEST RUN COMPLETE: ${passedTests} / ${totalTests} PASSED`);
    console.log('====================================================\n');

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

run();
