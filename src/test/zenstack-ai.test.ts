import { loadZModelAndDmmf } from "@zenstackhq/testtools";
import generate from "../zenstack-ai/zenstack-ai-plugin";
import path from "path";
import { z } from "zod";

describe("Zenstack AI Plugin", () => {
  it("should generate correct schemas", async () => {
    const { model } = await loadZModelAndDmmf(`
model List {
    id        String   @id @default(uuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
    ownerId   String   @default(auth().id)
    title     String   @length(1, 100)
    private   Boolean  @default(false)
    todos     Todo[]

    // can be read by owner or space members (only if not private) 
    @@allow('read', !private)

    // when create, owner must be set to current user, and user must be in the space
    @@allow('all', owner == auth())
}

/*
 * Model for a single Todo
 */
model Todo {
    id          String    @id @default(uuid())
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
    owner       User      @relation(fields: [ownerId], references: [id], onDelete: Cascade)
    ownerId     String    @default(auth().id)
    list        List      @relation(fields: [listId], references: [id], onDelete: Cascade)
    listId      String
    title       String    @length(1, 100)
    completedAt DateTime?

    @@allow('all', check(list, 'read'))
}

model User {
    id       String  @id @default(cuid())
    name     String?
    email    String? @unique
    // accounts      Account[]
    // sessions      Session[]
    password String  @password @omit

    // everyone can signup, and user profile is also publicly readable
    @@allow('create,read', true)

    // only the user can update or delete their own profile
    @@allow('update,delete', auth() == this)

    todo     Todo[]

    list     List[]
}


        `);
    await generate(model, {
      schemaPath: ".",
      provider: "zenstack-ai",
      output: `${__dirname}/result`,
    });

    // Define a function to compare generated and baseline types
    const compareTypes = async (types: string[]) => {
      for (const typeName of types) {
        // Import the generated and baseline schemas dynamically
        const generatedModule = (await import(
          path.join(__dirname, "result/all-schemas.ts")
        )) as Record<string, z.ZodObjectDef>;
        const baselineModule = (await import(
          path.join(__dirname, "baseline/baseline.ts")
        )) as Record<string, z.ZodObjectDef>;

        // Get the specific type from each module
        const generatedType = generatedModule[typeName];
        const baselineType = baselineModule[typeName];

        // Ensure both types exist
        expect(baselineType).toBeDefined();
        expect(generatedType).toBeDefined();

        // Deep equality comparison of schema structures
        if (baselineType && generatedType) {
          expect(JSON.stringify(baselineType.shape)).toEqual(
            JSON.stringify(generatedType.shape),
          );
        }
      }
    };

    // Compare the ListWhereInput type
    await compareTypes([
      "ListWhereInput",
      "ListFindManyArgsSchema",
      "ListUpdateInputSchema",
    ]);
  });
});
