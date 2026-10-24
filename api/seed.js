import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./src/config/prisma.js";

async function seed() {
  console.log("🌱 Starting database seeding...");
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // ─── 1. Seed Mock Users ─────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { phoneNumber: "09121111111" },
    update: {
      password: passwordHash,
      name: "Demo Admin",
    },
    create: {
      name: "Demo Admin",
      phoneNumber: "09121111111",
      password: passwordHash,
      preferredLocale: "en",
    },
  });

  const member = await prisma.user.upsert({
    where: { phoneNumber: "09122222222" },
    update: {
      password: passwordHash,
      name: "Alex Rivera (Lead Engineer)",
    },
    create: {
      name: "Alex Rivera (Lead Engineer)",
      phoneNumber: "09122222222",
      password: passwordHash,
      preferredLocale: "en",
    },
  });

  const member2 = await prisma.user.upsert({
    where: { phoneNumber: "09152498291" },
    update: {
      password: passwordHash,
      name: "Sarah Chen (Fullstack Dev)",
    },
    create: {
      name: "Sarah Chen (Fullstack Dev)",
      phoneNumber: "09152498291",
      password: passwordHash,
      preferredLocale: "en",
    },
  });

  console.log(`✅ Seeded Mock Users:`);
  console.log(`   - Demo Admin:  09121111111 / Password123! (ID: ${admin.id})`);
  console.log(`   - Alex Rivera: 09122222222 / Password123! (ID: ${member.id})`);
  console.log(`   - Sarah Chen:  09152498291 / Password123! (ID: ${member2.id})`);

  // ─── 2. Seed Mock Company ───────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { slug: "acme-corp" },
    update: {
      name: "Acme Corporation",
      creatorId: admin.id,
    },
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      creatorId: admin.id,
    },
  });

  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: admin.id } },
    update: { role: "OWNER" },
    create: { companyId: company.id, userId: admin.id, role: "OWNER" },
  });
  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: member.id } },
    update: { role: "ADMIN" },
    create: { companyId: company.id, userId: member.id, role: "ADMIN" },
  });
  await prisma.companyMember.upsert({
    where: { companyId_userId: { companyId: company.id, userId: member2.id } },
    update: { role: "MEMBER" },
    create: { companyId: company.id, userId: member2.id, role: "MEMBER" },
  });
  console.log(`✅ Seeded Company: ${company.name} (${company.slug})`);

  // ─── 3. Seed Mock Team ──────────────────────────────────────────────────────
  let team = await prisma.team.findFirst({
    where: { companyId: company.id, name: "Core Platform Engineering" },
  });
  if (!team) {
    team = await prisma.team.create({
      data: {
        name: "Core Platform Engineering",
        companyId: company.id,
      },
    });
  }

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: admin.id } },
    update: { role: "LEAD" },
    create: { teamId: team.id, userId: admin.id, role: "LEAD" },
  });
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: team.id, userId: member.id } },
    update: { role: "MEMBER" },
    create: { teamId: team.id, userId: member.id, role: "MEMBER" },
  });
  console.log(`✅ Seeded Team: ${team.name}`);

  // ─── 4. Seed Mock Project ───────────────────────────────────────────────────
  let project = await prisma.project.findFirst({
    where: { companyId: company.id, name: "Apollo Cloud Platform" },
  });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: "Apollo Cloud Platform",
        description: "Enterprise Agile task tracking, sprint management, and real-time collaboration suite",
        companyId: company.id,
        teamId: team.id,
        creatorId: admin.id,
        hourlyRateCents: 6500, // $65.00/hr
        currency: "USD",
        deadLine: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: admin.id } },
    update: { role: "MANAGER" },
    create: { projectId: project.id, userId: admin.id, role: "MANAGER" },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member.id } },
    update: { role: "DEVELOPER" },
    create: { projectId: project.id, userId: member.id, role: "DEVELOPER" },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member2.id } },
    update: { role: "DEVELOPER" },
    create: { projectId: project.id, userId: member2.id, role: "DEVELOPER" },
  });
  console.log(`✅ Seeded Project: ${project.name}`);

  // ─── 5. Seed Sprint ─────────────────────────────────────────────────────────
  let sprint = await prisma.sprint.findFirst({
    where: { projectId: project.id, name: "Sprint 1 - Foundation & Core API" },
  });
  if (!sprint) {
    sprint = await prisma.sprint.create({
      data: {
        name: "Sprint 1 - Foundation & Core API",
        goal: "Deliver real-time Kanban boards, multi-tenancy, and audit logs",
        projectId: project.id,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ Seeded Sprint: ${sprint.name}`);

  // ─── 6. Seed Labels ─────────────────────────────────────────────────────────
  await prisma.label.upsert({
    where: { companyId_name: { companyId: company.id, name: "Frontend" } },
    update: {},
    create: { companyId: company.id, name: "Frontend", color: "#3b82f6" },
  });
  await prisma.label.upsert({
    where: { companyId_name: { companyId: company.id, name: "Backend" } },
    update: {},
    create: { companyId: company.id, name: "Backend", color: "#10b981" },
  });
  await prisma.label.upsert({
    where: { companyId_name: { companyId: company.id, name: "Architecture" } },
    update: {},
    create: { companyId: company.id, name: "Architecture", color: "#8b5cf6" },
  });

  // ─── 7. Seed Tasks (All 4 Kanban Statuses) ──────────────────────────────────
  const taskCount = await prisma.task.count({ where: { projectId: project.id } });
  if (taskCount === 0) {
    const task1 = await prisma.task.create({
      data: {
        title: "Setup PostgreSQL schema and Prisma migrations",
        description: "Define entities for multi-tenancy, projects, teams, tasks, and audit logs.",
        status: "DONE",
        priority: "HIGH",
        projectId: project.id,
        sprintId: sprint.id,
        assigneeId: admin.id,
        reporterId: admin.id,
        storyPoints: 5,
        estimatedMinutes: 240,
      },
    });

    const task2 = await prisma.task.create({
      data: {
        title: "Implement real-time WebSocket communication",
        description: "Connect Socket.IO rooms for project board live sync and instant notifications.",
        status: "IN_PROGRESS",
        priority: "URGENT",
        projectId: project.id,
        sprintId: sprint.id,
        assigneeId: member.id,
        reporterId: admin.id,
        storyPoints: 8,
        estimatedMinutes: 360,
      },
    });

    const task3 = await prisma.task.create({
      data: {
        title: "Design responsive Kanban board UI with RTL support",
        description: "Build drag-and-drop board with light/dark theme support and bilingual typography.",
        status: "REVIEW",
        priority: "MEDIUM",
        projectId: project.id,
        sprintId: sprint.id,
        assigneeId: admin.id,
        reporterId: member.id,
        storyPoints: 5,
        estimatedMinutes: 300,
      },
    });

    const task4 = await prisma.task.create({
      data: {
        title: "Time tracking module with rate snapshotting",
        description: "Log hours with immutable historical financial snapshots for billable reports.",
        status: "TODO",
        priority: "HIGH",
        projectId: project.id,
        sprintId: sprint.id,
        assigneeId: member2.id,
        reporterId: admin.id,
        storyPoints: 3,
        estimatedMinutes: 180,
      },
    });

    // Sample comment
    await prisma.taskComment.create({
      data: {
        taskId: task2.id,
        userId: admin.id,
        content: "Socket.IO server heartbeat and room dispatchers look solid! Proceeding with client listeners.",
      },
    });

    // Sample time entry
    await prisma.timeEntry.create({
      data: {
        userId: admin.id,
        projectId: project.id,
        taskId: task1.id,
        duration: 180, // 3 hours
        description: "Designed schema models and applied initial migrations",
        rateSnapshotCents: 6500,
        earningsCents: 19500, // $195.00
      },
    });

    // Sample notification
    await prisma.notification.create({
      data: {
        userId: admin.id,
        title: "Welcome to Apollo Cloud Platform",
        message: "You have been assigned as Project Manager for Apollo Cloud Platform.",
        type: "PROJECT_ADDED",
        projectId: project.id,
        isRead: false,
      },
    });

    console.log(`✅ Seeded 4 sample tasks (TODO, IN_PROGRESS, REVIEW, DONE), comments, and time entries!`);
  }

  console.log("🎉 Seeding completed successfully!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
