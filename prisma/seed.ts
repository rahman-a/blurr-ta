import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
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

  // Create sample employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@company.com",
        phone: "+1-555-0101",
        departmentId: departments[0].id,
        positionId: engPositions[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@company.com",
        phone: "+1-555-0102",
        departmentId: departments[0].id,
        positionId: engPositions[1].id,
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@company.com",
        phone: "+1-555-0103",
        departmentId: departments[0].id,
        positionId: engPositions[2].id,
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "Sarah",
        lastName: "Wilson",
        email: "sarah.wilson@company.com",
        phone: "+1-555-0104",
        departmentId: departments[1].id,
        positionId: hrPositions[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@company.com",
        phone: "+1-555-0105",
        departmentId: departments[2].id,
        positionId: marketingPositions[0].id,
      },
    }),
  ]);

  console.log("✅ Created employees:", employees.length);

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "E-commerce Platform Redesign",
        description:
          "Complete redesign of the company's e-commerce platform with modern UI/UX and improved performance",
        status: "ACTIVE",
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-06-30"),
      },
    }),
    prisma.project.create({
      data: {
        name: "Mobile App Development",
        description: "Develop a native mobile application for iOS and Android platforms",
        status: "ACTIVE",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-08-15"),
      },
    }),
    prisma.project.create({
      data: {
        name: "HR Management System",
        description: "Internal HR management system for employee onboarding and performance tracking",
        status: "ON_HOLD",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-07-31"),
      },
    }),
    prisma.project.create({
      data: {
        name: "Marketing Campaign Q2",
        description: "Comprehensive marketing campaign for Q2 product launch",
        status: "COMPLETED",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31"),
      },
    }),
  ]);

  console.log("✅ Created projects:", projects.length);

  // Create sample tasks
  const tasks = await Promise.all([
    // E-commerce Platform Redesign tasks
    prisma.task.create({
      data: {
        title: "Design new homepage layout",
        description: "Create wireframes and mockups for the new homepage design",
        priority: "HIGH",
        status: "DONE",
        projectId: projects[0].id,
        assignedToId: employees[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement user authentication",
        description: "Develop secure user login and registration system",
        priority: "HIGH",
        status: "IN_PROGRESS",
        projectId: projects[0].id,
        assignedToId: employees[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Set up payment gateway",
        description: "Integrate Stripe payment processing",
        priority: "MEDIUM",
        status: "TODO",
        projectId: projects[0].id,
        assignedToId: employees[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Optimize database queries",
        description: "Improve database performance and query optimization",
        priority: "MEDIUM",
        status: "TODO",
        projectId: projects[0].id,
        assignedToId: employees[2].id,
      },
    }),

    // Mobile App Development tasks
    prisma.task.create({
      data: {
        title: "Create app wireframes",
        description: "Design wireframes for all app screens",
        priority: "HIGH",
        status: "DONE",
        projectId: projects[1].id,
        assignedToId: employees[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Develop login screen",
        description: "Implement user authentication screen for mobile app",
        priority: "HIGH",
        status: "IN_REVIEW",
        projectId: projects[1].id,
        assignedToId: employees[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement push notifications",
        description: "Add push notification functionality",
        priority: "MEDIUM",
        status: "TODO",
        projectId: projects[1].id,
      },
    }),

    // HR Management System tasks
    prisma.task.create({
      data: {
        title: "Employee onboarding workflow",
        description: "Design and implement employee onboarding process",
        priority: "HIGH",
        status: "IN_PROGRESS",
        projectId: projects[2].id,
        assignedToId: employees[3].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Performance review module",
        description: "Create performance review and tracking system",
        priority: "MEDIUM",
        status: "TODO",
        projectId: projects[2].id,
        assignedToId: employees[3].id,
      },
    }),

    // Marketing Campaign tasks
    prisma.task.create({
      data: {
        title: "Social media content calendar",
        description: "Create content calendar for Q2 social media posts",
        priority: "MEDIUM",
        status: "DONE",
        projectId: projects[3].id,
        assignedToId: employees[4].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Email marketing campaign",
        description: "Design and execute email marketing campaign",
        priority: "HIGH",
        status: "DONE",
        projectId: projects[3].id,
        assignedToId: employees[4].id,
      },
    }),
  ]);

  console.log("✅ Created tasks:", tasks.length);
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
