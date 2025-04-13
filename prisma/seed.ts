import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  const users = await prisma.user.findMany();
  const user = users[0]!;

  // Create 2-4 lists per user
  const numLists = Math.floor(Math.random() * 3) + 2;

  for (let i = 1; i <= numLists; i++) {
    const isPrivate = Math.random() > 0.5;
    const list = await prisma.list.create({
      data: {
        title: `${user.name}'s List ${i}`,
        private: isPrivate,
        ownerId: user.id,
      },
    });

    // Create 3-7 todos per list
    const numTodos = Math.floor(Math.random() * 5) + 3;

    for (let j = 1; j <= numTodos; j++) {
      // Make some todos completed
      const isCompleted = Math.random() > 0.7;

      await prisma.todo.create({
        data: {
          title: `Task ${j} for ${list.title}`,
          ownerId: user.id,
          listId: list.id,
          completedAt: isCompleted ? new Date() : null,
        },
      });
    }
  }
}

const listsCount = await prisma.list.count();
const todosCount = await prisma.todo.count();

await prisma.todo.findMany({
  where: {
    owner: {
      isNot: {
        name: "Alice",
      },
    },
  },
});

console.log(`Created ${listsCount} lists`);
console.log(`Created ${todosCount} todos`);
console.log("Database seeding completed successfully");

main().catch((e) => {
  console.error("Error during seeding:", e);
  process.exit(1);
});
