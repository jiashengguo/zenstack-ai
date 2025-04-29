// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  const password = await bcrypt.hash("123456", 12);
  // Clear existing data
  await prisma.todo.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();

  // Create 3 personas who work for zenstack.dev
  const personas = await Promise.all([
    prisma.user.create({
      data: {
        name: "Alex",
        email: "alex@zenstack.dev",
        password,
      },
    }),
    prisma.user.create({
      data: {
        name: "Taylor",
        email: "taylor@zenstack.dev",
        password,
      },
    }),
    prisma.user.create({
      data: {
        name: "Morgan",
        email: "morgan@zenstack.dev",
        password,
      },
    }),
  ]);

  console.log(`Created ${personas.length} personas`);

  // Map each user to their role
  const developer = personas[0]; // Alex - Backend Developer
  const designDev = personas[1]; // Taylor - Frontend Developer
  const productLead = personas[2]; // Morgan - Product Lead

  // Define meaningful personal todo tasks for each persona
  const personalTasks = {
    Alex: {
      // Backend Developer
      private: [
        "Optimize ZenStack ORM code generation",
        "Fix issue with SQLite adapter migrations",
        "Research improved password hashing algorithms",
        "Debug custom plugin loader for next release",
        "Prepare demo for PostgreSQL advanced features",
      ],
      public: [
        "Document new access policy functions",
        "Share benchmark results for latest ORM changes",
        "Create tutorial on custom plugin development",
        "Publish guide for ZenStack integration with tRPC",
        "Share database migration best practices",
      ],
    },
    Taylor: {
      // Frontend Developer
      private: [
        "Implement new React hooks for data fetching",
        "Fix TypeScript types in generated client code",
        "Improve error handling in query hooks",
        "Test Vue.js integration components",
        "Create demos for the new form validation helpers",
      ],
      public: [
        "Share React component library for ZenStack UI",
        "Publish guide for optimistic updates with ZenStack",
        "Post examples for real-time data subscription",
        "Share storybook demos for auth flow components",
        "Create tutorial for ZenStack + ShadcnUI integration",
      ],
    },
    Morgan: {
      // Product Lead
      private: [
        "Prepare Q3 roadmap for ZenStack Pro",
        "Research competitor pricing models",
        "Plan ZenStack conference talk proposals",
        "Draft partnership strategy with hosting providers",
        "Prepare investor update presentation",
      ],
      public: [
        "Share ZenStack product vision document",
        "Post feature prioritization framework",
        "Update release timeline for ZenStack 3.0",
        "Share enterprise customer case studies",
        "Publish success metrics for ZenStack community",
      ],
    },
  };

  // Create private and public lists for each persona with meaningful names
  for (const persona of personas) {
    // Private list for each persona
    const privateListNames = {
      Alex: "Backend Development Tasks",
      Taylor: "Frontend Implementation Work",
      Morgan: "Product & Business Planning",
    };

    const privateList = await prisma.list.create({
      data: {
        title: privateListNames[persona.name],
        private: true,
        ownerId: persona.id,
      },
    });

    // Create meaningful todos for private list
    const privateTasks = personalTasks[persona.name].private;
    for (let i = 0; i < privateTasks.length; i++) {
      // make a random create date between 15-30 days ago
      const createDate = new Date(
        Date.now() - Math.floor(Math.random() * 15 + 15) * 24 * 60 * 60 * 1000,
      );

      const completionStatus = Math.random();
      let completedAt = null;

      if (completionStatus > 0.6) {
        // Completed 1-14 days ago
        const daysAgo = Math.floor(Math.random() * 14) + 1;
        completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      }

      await prisma.todo.create({
        data: {
          title: privateTasks[i],
          ownerId: persona.id,
          listId: privateList.id,
          completedAt,
          createdAt: createDate,
        },
      });
    }

    // Public list for each persona with meaningful names
    const publicListNames = {
      Alex: "ZenStack Backend Resources",
      Taylor: "ZenStack Frontend Guides",
      Morgan: "ZenStack Roadmap & Updates",
    };

    const publicList = await prisma.list.create({
      data: {
        title: publicListNames[persona.name],
        private: false,
        ownerId: persona.id,
      },
    });

    // Create meaningful todos for public list
    const publicTasks = personalTasks[persona.name].public;
    for (let i = 0; i < publicTasks.length; i++) {
      // make a random create date between 15-30 days ago
      const createDate = new Date(
        Date.now() - Math.floor(Math.random() * 15 + 15) * 24 * 60 * 60 * 1000,
      );
      const completionStatus = Math.random();
      let completedAt = null;

      if (completionStatus > 0.5) {
        // Completed 1-10 days ago
        const daysAgo = Math.floor(Math.random() * 10) + 1;
        completedAt = new Date(2025, 3, 28 - daysAgo);
      }

      await prisma.todo.create({
        data: {
          title: publicTasks[i],
          ownerId: persona.id,
          listId: publicList.id,
          completedAt,
          createdAt: createDate,
        },
      });
    }
  }

  // Create a shared public list for the ZenStack feature development
  const sharedList = await prisma.list.create({
    data: {
      title: "ZenStack 3.0 Release Planning",
      private: false,
      ownerId: developer.id, // Alex (backend developer) is the owner of the shared list
    },
  });

  // Each persona adds their own todos to the shared list
  const sharedTasks = {
    Alex: [
      // Backend Developer
      "Backend: Implement schema inheritance feature",
      "Backend: Fix N+1 query performance issues",
      "Backend: Add support for composite indexes",
      "Backend: Create migration testing framework",
    ],
    Taylor: [
      // Frontend Developer
      "Frontend: Update React hooks for new schema features",
      "Frontend: Create example for real-time subscriptions",
      "Frontend: Improve type generation for relations",
      "Frontend: Add support for custom error handling",
    ],
    Morgan: [
      // Product Lead
      "Product: Define feature set for enterprise tier",
      "Product: Create documentation plan for v3 release",
      "Product: Coordinate beta testing program",
      "Product: Prepare marketing materials for launch",
    ],
  };

  // Project started about 3 weeks ago (April 7, 2025)
  const projectStartDate = new Date(2025, 3, 7);
  // Current sprint ends in 2 days (April 30, 2025)
  const sprintEndDate = new Date(2025, 3, 30);

  for (const persona of personas) {
    const personaTasks = sharedTasks[persona.name];

    for (const task of personaTasks) {
      // More sophisticated completion status - tasks are in various states
      // since we're in the middle of a sprint
      const taskStatus = Math.random();
      let completedAt = null;

      if (taskStatus < 0.3) {
        // Not started yet
        completedAt = null;
      } else if (taskStatus < 0.7) {
        // Completed during this sprint (last 1-14 days)
        const daysAgo = Math.floor(Math.random() * 14) + 1;
        completedAt = new Date(2025, 3, 28 - daysAgo);
      } else {
        // Completed at random times during the project
        const daysSinceStart = Math.floor(Math.random() * 21); // 0-20 days after project start
        completedAt = new Date(projectStartDate);
        completedAt.setDate(projectStartDate.getDate() + daysSinceStart);
      }

      await prisma.todo.create({
        data: {
          title: task,
          ownerId: persona.id,
          listId: sharedList.id,
          completedAt,
        },
      });
    }
  }

  // Create a community plan list
  const communityList = await prisma.list.create({
    data: {
      title: "ZenStack Community Initiatives",
      private: false,
      ownerId: productLead.id, // Morgan (product lead) is the owner
    },
  });

  // Add community tasks with assignees
  const communityTasks = [
    {
      title: "Create 'Getting Started' video tutorial series",
      owner: "Taylor",
      completed: true,
      completedDate: new Date(2025, 3, 15), // April 15, 2025
    },
    {
      title: "Set up community Discord server moderation",
      owner: "Morgan",
      completed: true,
      completedDate: new Date(2025, 3, 12), // April 12, 2025
    },
    {
      title: "Develop starter templates for common frameworks",
      owner: "Alex",
      completed: true,
      completedDate: new Date(2025, 3, 20), // April 20, 2025
    },
    {
      title: "Plan monthly community office hours",
      owner: "Morgan",
      completed: false,
      completedDate: null,
    },
    {
      title: "Create GitHub issue templates for contributions",
      owner: "Alex",
      completed: false,
      completedDate: null,
    },
    {
      title: "Develop interactive playground for docs website",
      owner: "Taylor",
      completed: false,
      completedDate: null,
    },
    {
      title: "Schedule community show & tell sessions",
      owner: "Morgan",
      completed: false,
      completedDate: null,
    },
    {
      title: "Create contributor recognition program",
      owner: "Morgan",
      completed: false,
      completedDate: null,
    },
  ];

  for (const task of communityTasks) {
    const owner = personas.find((p) => p.name === task.owner);

    await prisma.todo.create({
      data: {
        title: task.title,
        ownerId: owner.id,
        listId: communityList.id,
        completedAt: task.completed ? task.completedDate : null,
      },
    });
  }

  // Create a feature request list
  const featureList = await prisma.list.create({
    data: {
      title: "ZenStack Feature Requests",
      private: false,
      ownerId: productLead.id, // Morgan owns this list
    },
  });

  // Add feature request items with assignees
  const featureItems = [
    {
      title: "Add support for multiple databases in single project",
      assignee: "Alex",
      completed: false,
    },
    {
      title: "Create Vue.js integration package",
      assignee: "Taylor",
      completed: true,
      completedDate: new Date(2025, 3, 18), // April 18, 2025
    },
    {
      title: "Add native MongoDB support",
      assignee: "Alex",
      completed: false,
    },
    {
      title: "Improve error messages for policy violations",
      assignee: "Taylor",
      completed: false,
    },
    {
      title: "Support for custom validation functions in schema",
      assignee: "Alex",
      completed: false,
    },
    {
      title: "Add SvelteKit integration package",
      assignee: "Taylor",
      completed: false,
    },
    {
      title: "Implement schema versioning and migration preview",
      assignee: "Alex",
      completed: false,
    },
  ];

  for (const item of featureItems) {
    const assignee = personas.find((p) => p.name === item.assignee);

    await prisma.todo.create({
      data: {
        title: item.title,
        ownerId: assignee.id,
        listId: featureList.id,
        completedAt: item.completed ? item.completedDate : null,
      },
    });
  }

  const listsCount = await prisma.list.count();
  const todosCount = await prisma.todo.count();

  console.log(`Created ${listsCount} lists`);
  console.log(`Created ${todosCount} todos`);
  console.log("Database seeding completed successfully");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
