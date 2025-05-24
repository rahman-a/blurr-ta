import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.employee.deleteMany();
  await prisma.position.deleteMany();
  await prisma.department.deleteMany();

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Engineering",
        description: "Software development and technical infrastructure",
      },
    }),
    prisma.department.create({
      data: {
        name: "Human Resources",
        description: "Employee management and organizational development",
      },
    }),
    prisma.department.create({
      data: {
        name: "Marketing",
        description: "Brand promotion and customer acquisition",
      },
    }),
    prisma.department.create({
      data: {
        name: "Sales",
        description: "Revenue generation and customer relationships",
      },
    }),
    prisma.department.create({
      data: {
        name: "Finance",
        description: "Financial planning and accounting",
      },
    }),
  ]);

  console.log("✅ Created departments:", departments.length);

  // Create positions for each department
  const positions = [];

  // Engineering positions
  const engPositions = await Promise.all([
    prisma.position.create({
      data: {
        title: "Frontend Developer",
        description: "Develop user interfaces and client-side applications",
        departmentId: departments[0].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Backend Developer",
        description: "Develop server-side applications and APIs",
        departmentId: departments[0].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "DevOps Engineer",
        description: "Manage infrastructure and deployment pipelines",
        departmentId: departments[0].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Tech Lead",
        description: "Lead technical projects and mentor developers",
        departmentId: departments[0].id,
      },
    }),
  ]);

  // HR positions
  const hrPositions = await Promise.all([
    prisma.position.create({
      data: {
        title: "HR Manager",
        description: "Manage human resources operations",
        departmentId: departments[1].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Recruiter",
        description: "Find and hire talented employees",
        departmentId: departments[1].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "HR Coordinator",
        description: "Support HR operations and employee relations",
        departmentId: departments[1].id,
      },
    }),
  ]);

  // Marketing positions
  const marketingPositions = await Promise.all([
    prisma.position.create({
      data: {
        title: "Marketing Manager",
        description: "Lead marketing campaigns and strategy",
        departmentId: departments[2].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Content Creator",
        description: "Create engaging content for various platforms",
        departmentId: departments[2].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Social Media Specialist",
        description: "Manage social media presence and engagement",
        departmentId: departments[2].id,
      },
    }),
  ]);

  // Sales positions
  const salesPositions = await Promise.all([
    prisma.position.create({
      data: {
        title: "Sales Manager",
        description: "Lead sales team and drive revenue growth",
        departmentId: departments[3].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Account Executive",
        description: "Manage client accounts and close deals",
        departmentId: departments[3].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Sales Development Representative",
        description: "Generate leads and qualify prospects",
        departmentId: departments[3].id,
      },
    }),
  ]);

  // Finance positions
  const financePositions = await Promise.all([
    prisma.position.create({
      data: {
        title: "Finance Manager",
        description: "Oversee financial operations and reporting",
        departmentId: departments[4].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Accountant",
        description: "Handle bookkeeping and financial transactions",
        departmentId: departments[4].id,
      },
    }),
    prisma.position.create({
      data: {
        title: "Financial Analyst",
        description: "Analyze financial data and create reports",
        departmentId: departments[4].id,
      },
    }),
  ]);

  positions.push(...engPositions, ...hrPositions, ...marketingPositions, ...salesPositions, ...financePositions);

  console.log("✅ Created positions:", positions.length);
  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
