// ============================================================
//  Full Demo Seed Script
//  - Wipes DB, creates Admin, 5 Managers, 25 Employees
//  - 3 Goal Cycles
//  - 15 goals per employee (5 per cycle) with weightage = 100
//  - Some goals shared across 2-3 employees
//  - Random check-ins reviewed by managers
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ──────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────
const hash = (p) => bcrypt.hash(p, 12);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function weightages5() {
  // 5 integers that sum to 100, each ≥ 10
  const base = [10, 10, 10, 10, 10];
  let remaining = 50;
  for (let i = 0; i < 4; i++) {
    const add = randInt(0, remaining - (4 - i) * 0);
    base[i] += add;
    remaining -= add;
  }
  base[4] += remaining;
  // shuffle
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base;
}

const THRUST_AREAS = [
  "Sales",
  "Operations",
  "Customer Success",
  "Engineering",
  "HR",
  "Finance",
];

const UOMS = ["NUMERIC", "PERCENTAGE", "TIMELINE", "ZERO_BASED"];

const DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Operations",
  "Finance",
  "HR",
];

const DESIGNATIONS = [
  "Software Engineer",
  "Senior Engineer",
  "Business Analyst",
  "Product Manager",
  "HR Executive",
  "Finance Analyst",
  "Operations Lead",
  "Sales Executive",
  "Customer Success Manager",
  "QA Engineer",
];

const GENDERS = ["MALE", "FEMALE", "OTHER"];

const GOAL_TITLES = [
  "Increase quarterly revenue by 20%",
  "Reduce operational costs by 15%",
  "Launch 3 new product features",
  "Achieve 95% customer satisfaction score",
  "Complete cloud migration phase 2",
  "Hire 10 senior engineers",
  "Improve code coverage to 80%",
  "Reduce bug resolution time to 24h",
  "Deploy CI/CD pipeline for all services",
  "Complete compliance audit with zero findings",
  "Grow LinkedIn followers by 5000",
  "Onboard 50 new enterprise clients",
  "Reduce customer churn to below 5%",
  "Launch employee upskilling program",
  "Achieve ISO 27001 certification",
  "Deliver 12 sprint releases on time",
  "Migrate legacy systems to microservices",
  "Reduce average ticket resolution time by 30%",
  "Expand to 3 new markets",
  "Close 200 inbound leads",
  "Automate payroll processing",
  "Reduce HR onboarding time by 40%",
  "Increase NPS score to 70+",
  "Build internal analytics dashboard",
  "Complete security penetration testing",
  "Implement real-time monitoring",
  "Publish 24 technical blog posts",
  "Achieve zero downtime deployment",
  "Train 100 employees on new tools",
  "Reduce infrastructure costs by 25%",
];

// ──────────────────────────────────────────
// Credentials table (printed at end)
// ──────────────────────────────────────────
const credentials = [];

// ──────────────────────────────────────────
// Main
// ──────────────────────────────────────────
async function main() {
  console.log("🗑️  Wiping database...");
  // Delete in dependency order
  await prisma.checkin.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalUnlockRequest.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.checkinWindow.deleteMany();
  await prisma.goalCycle.deleteMany();
  await prisma.education.deleteMany();
  await prisma.employeeProject.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.positionOfResponsibility.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.managerEducation.deleteMany();
  await prisma.managerProject.deleteMany();
  await prisma.managerCertification.deleteMany();
  await prisma.managerPositionOfResponsibility.deleteMany();
  await prisma.managerProfile.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.manager.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Database wiped.\n");

  // ── 1. Admin ──────────────────────────────
  console.log("👤 Creating Admin...");
  const adminPassword = "Admin@123";
  const adminUser = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@goaltracking.com",
      password: await hash(adminPassword),
      role: "ADMIN",
    },
  });
  credentials.push({
    role: "ADMIN",
    name: adminUser.name,
    email: adminUser.email,
    password: adminPassword,
  });
  console.log(`   ✅ Admin: ${adminUser.email} / ${adminPassword}\n`);

  // ── 2. Managers ───────────────────────────
  console.log("👔 Creating 5 Managers...");
  const managerData = [
    {
      firstName: "Rahul",
      lastName: "Sharma",
      gmail: "rahul.sharma.mgr2025@gmail.com",
      dept: "Engineering",
      gender: "MALE",
    },
    {
      firstName: "Priya",
      lastName: "Verma",
      gmail: "priya.verma.mgr2025@gmail.com",
      dept: "Sales",
      gender: "FEMALE",
    },
    {
      firstName: "Amit",
      lastName: "Patel",
      gmail: "amit.patel.mgr2025@gmail.com",
      dept: "Operations",
      gender: "MALE",
    },
    {
      firstName: "Sunita",
      lastName: "Rao",
      gmail: "sunita.rao.mgr2025@gmail.com",
      dept: "Finance",
      gender: "FEMALE",
    },
    {
      firstName: "Karthik",
      lastName: "Nair",
      gmail: "karthik.nair.mgr2025@gmail.com",
      dept: "HR",
      gender: "MALE",
    },
  ];

  const managers = [];
  for (let i = 0; i < managerData.length; i++) {
    const md = managerData[i];
    const pwd = `Manager@${100 + i + 1}`;
    const managerCode = `MGR${String(i + 1).padStart(3, "0")}`;
    const user = await prisma.user.create({
      data: {
        name: `${md.firstName} ${md.lastName}`,
        email: md.gmail,
        password: await hash(pwd),
        role: "MANAGER",
      },
    });
    const mgr = await prisma.manager.create({
      data: {
        managerCode,
        userId: user.id,
        department: md.dept,
        gender: md.gender,
        phone: `+91 98${randInt(10, 99)}${randInt(100000, 999999)}`,
        address: `${randInt(1, 99)}, MG Road, ${md.dept} District, Bangalore`,
        status: "ACTIVE",
      },
    });
    managers.push(mgr);
    credentials.push({
      role: "MANAGER",
      name: user.name,
      email: user.email,
      password: pwd,
      code: managerCode,
      department: md.dept,
    });
    console.log(`   ✅ ${user.name} (${managerCode}) — ${user.email}`);
  }

  // ── 3. Employees (25) ─────────────────────
  console.log("\n👥 Creating 25 Employees...");
  const employeeNames = [
    // Manager 1 (Engineering)
    { first: "Arjun", last: "Reddy", gmail: "arjun.reddy.emp2025@gmail.com", gender: "MALE" },
    { first: "Meera", last: "Krishnan", gmail: "meera.krishnan.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Rohit", last: "Gupta", gmail: "rohit.gupta.emp2025@gmail.com", gender: "MALE" },
    { first: "Anjali", last: "Singh", gmail: "anjali.singh.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Dev", last: "Kumar", gmail: "dev.kumar.emp2025@gmail.com", gender: "MALE" },
    // Manager 2 (Sales)
    { first: "Neha", last: "Joshi", gmail: "neha.joshi.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Vikram", last: "Shah", gmail: "vikram.shah.emp2025@gmail.com", gender: "MALE" },
    { first: "Pooja", last: "Mishra", gmail: "pooja.mishra.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Suresh", last: "Iyer", gmail: "suresh.iyer.emp2025@gmail.com", gender: "MALE" },
    { first: "Divya", last: "Menon", gmail: "divya.menon.emp2025@gmail.com", gender: "FEMALE" },
    // Manager 3 (Operations)
    { first: "Aakash", last: "Tiwari", gmail: "aakash.tiwari.emp2025@gmail.com", gender: "MALE" },
    { first: "Sneha", last: "Pandey", gmail: "sneha.pandey.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Manish", last: "Agarwal", gmail: "manish.agarwal.emp2025@gmail.com", gender: "MALE" },
    { first: "Kavitha", last: "Nair", gmail: "kavitha.nair.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Ravi", last: "Chandran", gmail: "ravi.chandran.emp2025@gmail.com", gender: "MALE" },
    // Manager 4 (Finance)
    { first: "Lakshmi", last: "Bhat", gmail: "lakshmi.bhat.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Sanjay", last: "Mehta", gmail: "sanjay.mehta.emp2025@gmail.com", gender: "MALE" },
    { first: "Aarti", last: "Pillai", gmail: "aarti.pillai.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Gopal", last: "Das", gmail: "gopal.das.emp2025@gmail.com", gender: "MALE" },
    { first: "Nandini", last: "Rao", gmail: "nandini.rao.emp2025@gmail.com", gender: "FEMALE" },
    // Manager 5 (HR)
    { first: "Tarun", last: "Saxena", gmail: "tarun.saxena.emp2025@gmail.com", gender: "MALE" },
    { first: "Pallavi", last: "Jain", gmail: "pallavi.jain.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Vivek", last: "Bhatt", gmail: "vivek.bhatt.emp2025@gmail.com", gender: "MALE" },
    { first: "Shilpa", last: "Desai", gmail: "shilpa.desai.emp2025@gmail.com", gender: "FEMALE" },
    { first: "Nikhil", last: "Kapoor", gmail: "nikhil.kapoor.emp2025@gmail.com", gender: "MALE" },
  ];

  const employees = [];
  for (let i = 0; i < employeeNames.length; i++) {
    const en = employeeNames[i];
    const mgrIndex = Math.floor(i / 5); // 5 employees per manager
    const mgr = managers[mgrIndex];
    const dept = managerData[mgrIndex].dept;
    const pwd = `Emp@${1001 + i}`;
    const empCode = `EMP${String(i + 1).padStart(3, "0")}`;

    const user = await prisma.user.create({
      data: {
        name: `${en.first} ${en.last}`,
        email: en.gmail,
        password: await hash(pwd),
        role: "EMPLOYEE",
      },
    });

    const emp = await prisma.employee.create({
      data: {
        employeeCode: empCode,
        userId: user.id,
        managerId: mgr.id,
        department: dept,
        designation: pick(DESIGNATIONS),
        gender: en.gender,
        phone: `+91 91${randInt(10, 99)}${randInt(100000, 999999)}`,
        address: `${randInt(1, 200)}, ${pick(["Park Avenue", "Lake View", "Brigade Road", "Indiranagar", "Koramangala"])}, Bangalore`,
        status: "ACTIVE",
      },
    });

    employees.push(emp);
    credentials.push({
      role: "EMPLOYEE",
      name: user.name,
      email: user.email,
      password: pwd,
      code: empCode,
      manager: `${managerData[mgrIndex].firstName} ${managerData[mgrIndex].lastName}`,
      department: dept,
    });
    console.log(`   ✅ ${user.name} (${empCode}) → Manager: ${managerData[mgrIndex].firstName}`);
  }

  // ── 4. Goal Cycles ───────────────────────
  console.log("\n📅 Creating 3 Goal Cycles...");
  const cyclesData = [
    {
      name: "FY 2024-25 Annual Goals",
      description: "Annual performance goals for the financial year 2024-25",
      startDate: new Date("2024-04-01"),
      endDate: new Date("2025-03-31"),
      goalOpenDate: new Date("2024-04-01"),
      goalCloseDate: new Date("2024-04-30"),
      status: "CLOSED",
      isActive: false,
    },
    {
      name: "FY 2025-26 H1 Goals",
      description: "Half-year goals for April to September 2025",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-09-30"),
      goalOpenDate: new Date("2025-04-01"),
      goalCloseDate: new Date("2025-04-30"),
      status: "CLOSED",
      isActive: false,
    },
    {
      name: "FY 2025-26 H2 Goals",
      description: "Half-year goals for October 2025 to March 2026",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-03-31"),
      goalOpenDate: new Date("2025-10-01"),
      goalCloseDate: new Date("2026-03-31"),
      status: "ACTIVE",
      isActive: true,
    },
  ];

  const cycles = [];
  for (const cd of cyclesData) {
    const cycle = await prisma.goalCycle.create({
      data: {
        ...cd,
        createdBy: adminUser.id,
        checkinWindows: {
          create: [
            {
              period: "Q1",
              openDate: new Date(cd.startDate.getTime()),
              closeDate: new Date(cd.startDate.getTime() + 45 * 24 * 60 * 60 * 1000),
            },
            {
              period: "Q2",
              openDate: new Date(cd.startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
              closeDate: new Date(cd.startDate.getTime() + 135 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    });
    cycles.push(cycle);
    console.log(`   ✅ ${cycle.name} [${cycle.status}]`);
  }

  // ── 5. Shared Goals (6 total across cycles) ──
  console.log("\n🔗 Creating Shared Goals...");
  const sharedGoalsData = [
    {
      title: "Achieve ISO 27001 certification",
      description: "Organization-wide ISO 27001 security certification",
      thrustArea: "Operations",
      uom: "ZERO_BASED",
      target: 1,
      weightage: 20,
    },
    {
      title: "Deploy CI/CD pipeline for all services",
      description: "Unified DevOps pipeline across all product services",
      thrustArea: "Engineering",
      uom: "NUMERIC",
      target: 15,
      weightage: 15,
    },
    {
      title: "Onboard 50 new enterprise clients",
      description: "Combined sales team effort to acquire enterprise clients",
      thrustArea: "Sales",
      uom: "NUMERIC",
      target: 50,
      weightage: 25,
    },
    {
      title: "Launch employee upskilling program",
      description: "Cross-departmental training and development initiative",
      thrustArea: "HR",
      uom: "NUMERIC",
      target: 100,
      weightage: 20,
    },
    {
      title: "Reduce infrastructure costs by 25%",
      description: "Engineering and Finance joint cost reduction initiative",
      thrustArea: "Finance",
      uom: "PERCENTAGE",
      target: 25,
      weightage: 20,
    },
    {
      title: "Implement real-time monitoring",
      description: "Real-time alerting and observability across all systems",
      thrustArea: "Engineering",
      uom: "ZERO_BASED",
      target: 1,
      weightage: 15,
    },
  ];

  const sharedGoals = [];
  for (const sg of sharedGoalsData) {
    const s = await prisma.sharedGoal.create({ data: { ...sg, active: true } });
    sharedGoals.push(s);
    console.log(`   ✅ SharedGoal: "${s.title}"`);
  }

  // ── 6. Goal Sheets + Goals (15 per employee) ──
  console.log("\n🎯 Creating Goal Sheets & Goals (15 per employee across 3 cycles)...");

  // We'll assign shared goals to some employees (2-3 per shared goal)
  // shared goal index → list of employee indices that use it
  const sharedGoalAssignments = {
    0: [0, 1, 10],       // ISO cert → emp 1,2 (Engineering) + emp 11 (Operations)
    1: [2, 3, 11],       // CI/CD → emp 3,4 (Engineering) + emp 12 (Operations)
    2: [5, 6, 7],        // Enterprise clients → emp 6,7,8 (Sales)
    3: [20, 21, 22],     // Upskilling → emp 21,22,23 (HR)
    4: [15, 16],         // Cost reduction → emp 16,17 (Finance)
    5: [4, 12],          // Real-time monitoring → emp 5 (Engineering) + emp 13 (Ops)
  };

  // Goal title pool per employee — rotate through GOAL_TITLES
  let titleIdx = 0;
  const nextTitle = () => {
    const t = GOAL_TITLES[titleIdx % GOAL_TITLES.length];
    titleIdx++;
    return t;
  };

  for (let ei = 0; ei < employees.length; ei++) {
    const emp = employees[ei];

    for (let ci = 0; ci < cycles.length; ci++) {
      const cycle = cycles[ci];
      const weights = weightages5();

      // Determine which shared goals this employee gets in this cycle (at most 1 per sheet)
      let sharedGoalForThisSheet = null;
      for (const [sgIdx, empIdxList] of Object.entries(sharedGoalAssignments)) {
        if (empIdxList.includes(ei) && ci === 1) {
          // assign shared goals in cycle index 1 (H1)
          sharedGoalForThisSheet = sharedGoals[parseInt(sgIdx)];
          break;
        }
      }

      const sheetStatus = ci < 2 ? "APPROVED" : "SUBMITTED";
      const isLocked = ci < 2;

      const sheet = await prisma.goalSheet.create({
        data: {
          employeeId: emp.id,
          cycleId: cycle.id,
          status: sheetStatus,
          isLocked,
          submittedAt: ci < 2 ? new Date(cycle.goalOpenDate.getTime() + 7 * 24 * 60 * 60 * 1000) : new Date(),
          approvedAt: ci < 2 ? new Date(cycle.goalOpenDate.getTime() + 14 * 24 * 60 * 60 * 1000) : null,
        },
      });

      // Create 5 goals for this sheet
      const goalIds = [];
      for (let gi = 0; gi < 5; gi++) {
        const isSharedGoal = gi === 0 && sharedGoalForThisSheet;
        const sg = isSharedGoal ? sharedGoalForThisSheet : null;
        const thrustArea = sg ? sg.thrustArea : pick(THRUST_AREAS);
        const uom = sg ? sg.uom : pick(UOMS);
        const target = sg ? sg.target : randInt(10, 100);
        const weight = isSharedGoal ? sg.weightage : weights[gi];
        const goalProgress = ci < 2 ? randInt(60, 100) : randInt(0, 60);
        const goalStatus =
          goalProgress === 100
            ? "COMPLETED"
            : goalProgress >= 40
            ? "ON_TRACK"
            : "NOT_STARTED";

        const goal = await prisma.goal.create({
          data: {
            goalSheetId: sheet.id,
            sharedGoalId: sg ? sg.id : null,
            title: sg ? sg.title : nextTitle(),
            description: sg
              ? sg.description
              : `Achieve targets for ${thrustArea} area in ${cycle.name}`,
            thrustArea,
            uom,
            target,
            achievement: parseFloat(((target * goalProgress) / 100).toFixed(1)),
            weightage: weight,
            status: goalStatus,
            progress: goalProgress,
          },
        });
        goalIds.push(goal.id);
      }

      // ── 7. Check-ins on closed cycles ──────
      if (ci < 2) {
        // Create 2-3 check-ins per goal in past cycles
        for (const goalId of goalIds) {
          const checkinCount = randInt(2, 3);
          for (let k = 0; k < checkinCount; k++) {
            const ach = randInt(20, 95);
            const isApproved = k < checkinCount - 1 || Math.random() > 0.2;
            await prisma.checkin.create({
              data: {
                goalId,
                achievement: ach,
                employeeComment: pick([
                  "On track with planned milestones.",
                  "Completed this phase ahead of schedule.",
                  "Facing minor blockers but progressing well.",
                  "Achieved the quarterly milestone successfully.",
                  "Need additional resources to accelerate.",
                  "Exceeded expectation for this period.",
                ]),
                managerFeedback: isApproved
                  ? pick([
                      "Great progress! Keep it up.",
                      "Well done. Continue this trajectory.",
                      "Excellent work. Targets look achievable.",
                      "Good effort. Stay focused on deliverables.",
                    ])
                  : pick([
                      "Please provide more details on blockers.",
                      "The achievement seems lower than expected. Review strategy.",
                    ]),
                status: isApproved ? "APPROVED" : "RETURNED",
                goalStatus: ach >= 90 ? "COMPLETED" : "ON_TRACK",
                submittedAt: new Date(cycle.startDate.getTime() + (k + 1) * 45 * 24 * 60 * 60 * 1000),
                reviewedAt: new Date(cycle.startDate.getTime() + (k + 1) * 45 * 24 * 60 * 60 * 1000 + 3 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
      }
    }

    if ((ei + 1) % 5 === 0) {
      console.log(`   ✅ ${ei + 1}/25 employees done`);
    }
  }

  // ── 8. Print Credentials ─────────────────
  console.log("\n\n" + "=".repeat(80));
  console.log("  CREDENTIALS SUMMARY");
  console.log("=".repeat(80));

  const admin = credentials.filter((c) => c.role === "ADMIN");
  const mgrs = credentials.filter((c) => c.role === "MANAGER");
  const emps = credentials.filter((c) => c.role === "EMPLOYEE");

  console.log("\n📌 ADMIN");
  console.log("-".repeat(60));
  for (const c of admin) {
    console.log(`  Name    : ${c.name}`);
    console.log(`  Email   : ${c.email}`);
    console.log(`  Password: ${c.password}`);
  }

  console.log("\n📌 MANAGERS (5)");
  console.log("-".repeat(60));
  for (const c of mgrs) {
    console.log(
      `  ${c.code}  ${c.name.padEnd(20)} | Email: ${c.email.padEnd(38)} | Pwd: ${c.password} | Dept: ${c.department}`
    );
  }

  console.log("\n📌 EMPLOYEES (25)");
  console.log("-".repeat(60));
  for (const c of emps) {
    console.log(
      `  ${c.code}  ${c.name.padEnd(20)} | Email: ${c.email.padEnd(40)} | Pwd: ${c.password} | Manager: ${c.manager}`
    );
  }

  console.log("\n" + "=".repeat(80));
  console.log("🌱 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
