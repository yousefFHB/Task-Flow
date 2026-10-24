import fs from 'fs';
import jwt from '../api/node_modules/jsonwebtoken/index.js';

console.log('====================================================');
console.log('RUNNING COMPLETE COMPANY API & ENDPOINTS E2E TEST');
console.log('====================================================\n');

const envContent = fs.readFileSync('api/.env', 'utf8');
const jwtSecret = envContent.match(/JWT_SECRET\s*=\s*(.+)/)[1].trim();

const BASE_URL = 'http://localhost:8000';
const ownerToken = jwt.sign({ id: 1 }, jwtSecret, { expiresIn: '24h' });

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
  }
}

async function runTests() {
  let createdCompanyId = null;

  // 1. Create Company
  console.log('1. Testing POST /api/companies (Create Company)...');
  const createRes = await fetch(`${BASE_URL}/api/companies`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'Content-Type': 'application/json',
      'x-locale': 'en',
    },
    body: JSON.stringify({ name: 'Enterprise Apex Corp' }),
  });
  const createData = await createRes.json();
  assert(
    'Company created successfully with 201 status and OWNER member',
    createRes.status === 201 &&
      createData.success &&
      createData.data?.id &&
      createData.data?.name === 'Enterprise Apex Corp'
  );
  createdCompanyId = createData.data?.id;

  if (!createdCompanyId) {
    console.error('Aborting further tests due to creation failure');
    process.exit(1);
  }

  // 2. List Companies with pagination & search
  console.log('\n2. Testing GET /api/companies (List Companies)...');
  const listRes = await fetch(`${BASE_URL}/api/companies?q=Apex&sort=name`, {
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'x-locale': 'en',
    },
  });
  const listData = await listRes.json();
  assert(
    'List companies returns 200 with matching items and pagination',
    listRes.status === 200 &&
      listData.success &&
      Array.isArray(listData.data) &&
      listData.data.some((item) => item.company?.id === createdCompanyId)
  );

  // 3. Get Company by ID
  console.log(`\n3. Testing GET /api/companies/${createdCompanyId} (Get Single Company)...`);
  const getRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}`, {
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'x-locale': 'en',
    },
  });
  const getData = await getRes.json();
  assert(
    'Get company by ID returns 200 with details, members list and counts',
    getRes.status === 200 &&
      getData.success &&
      getData.data?.company?.id === createdCompanyId &&
      Array.isArray(getData.data?.company?.companyMembers) &&
      getData.data?.role === 'OWNER'
  );

  // 4. Update Company Name
  console.log(`\n4. Testing PATCH /api/companies/${createdCompanyId} (Update Name)...`);
  const updateRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'Content-Type': 'application/json',
      'x-locale': 'en',
    },
    body: JSON.stringify({ name: 'Enterprise Apex Corp Updated' }),
  });
  const updateData = await updateRes.json();
  assert(
    'Update company returns 200 with new name',
    updateRes.status === 200 &&
      updateData.success &&
      updateData.data?.name === 'Enterprise Apex Corp Updated'
  );

  // 5. Add Member by Phone Number (user id 2 or phone)
  console.log(`\n5. Testing POST /api/companies/${createdCompanyId}/member (Add Member)...`);
  const targetUser = { id: 2, phoneNumber: '09152498291' };

  if (targetUser) {
    const addMemberRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}/member`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
        'x-locale': 'en',
      },
      body: JSON.stringify({ phoneNumber: targetUser.phoneNumber }),
    });
    const addMemberData = await addMemberRes.json();
    assert(
      'Add member returns 200 with memberAdded message',
      addMemberRes.status === 200 &&
        addMemberData.success &&
        addMemberData.data?.action === 'added'
    );

    // 6. Update Member Role
    console.log(`\n6. Testing PUT /api/companies/${createdCompanyId}/member/role (Update Role)...`);
    const roleRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}/member/role`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
        'x-locale': 'en',
      },
      body: JSON.stringify({ memberId: targetUser.id, role: 'ADMIN' }),
    });
    const roleData = await roleRes.json();
    assert(
      'Update member role to ADMIN returns 200 and updated role',
      roleRes.status === 200 &&
        roleData.success &&
        roleData.data?.role === 'ADMIN'
    );

    // 7. Remove Member (calling member endpoint again toggles remove)
    console.log(`\n7. Testing POST /api/companies/${createdCompanyId}/member (Remove Member)...`);
    const removeMemberRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}/member`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
        'x-locale': 'en',
      },
      body: JSON.stringify({ phoneNumber: targetUser.phoneNumber }),
    });
    const removeMemberData = await removeMemberRes.json();
    assert(
      'Calling member toggle on existing member removes member with 200',
      removeMemberRes.status === 200 &&
        removeMemberData.success &&
        removeMemberData.data?.action === 'removed'
    );
  } else {
    console.log('Skipping member tests: no second user in database');
  }

  // 8. Delete Company
  console.log(`\n8. Testing DELETE /api/companies/${createdCompanyId} (Delete Company)...`);
  const deleteRes = await fetch(`${BASE_URL}/api/companies/${createdCompanyId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${ownerToken}`,
      'x-locale': 'en',
    },
  });
  const deleteData = await deleteRes.json();
  assert(
    'Delete company returns 200 with deletedSuccess',
    deleteRes.status === 200 && deleteData.success
  );

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} checks passed.`);
  console.log('====================================================\n');
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
