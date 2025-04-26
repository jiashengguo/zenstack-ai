import { z } from "zod";
// Define schemas for basic field filters
const StringFilter = z
  .object({
    equals: z.string().optional(),
    in: z.array(z.string()).optional(),
    notIn: z.array(z.string()).optional(),
    lt: z.string().optional(),
    lte: z.string().optional(),
    gt: z.string().optional(),
    gte: z.string().optional(),
    contains: z.string().optional(),
    startsWith: z.string().optional(),
    endsWith: z.string().optional(),
    not: z.string().optional(),
  })
  .optional();
const BooleanFilter = z
  .object({
    equals: z.boolean().optional(),
    not: z.boolean().optional(),
  })
  .optional();
const DateTimeFilter = z
  .object({
    equals: z.date().or(z.string()).optional(),
    in: z.array(z.date().or(z.string())).optional(),
    notIn: z.array(z.date().or(z.string())).optional(),
    lt: z.date().or(z.string()).optional(),
    lte: z.date().or(z.string()).optional(),
    gt: z.date().or(z.string()).optional(),
    gte: z.date().or(z.string()).optional(),
    not: z.date().or(z.string()).optional(),
  })
  .optional();
const notNullFilter = z.object({
  not: z.null(),
});
// Define ListListRelationFilter for use in where input
const ListListRelationFilter = z
  .object({
    every: z.lazy(() => ListWhereInput).optional(),
    some: z.lazy(() => ListWhereInput).optional(),
    none: z.lazy(() => ListWhereInput).optional(),
  })
  .optional();
const ListRelationFilter = z
  .object({
    is: z.lazy(() => ListWhereInput).optional(),
    isNot: z.lazy(() => ListWhereInput).optional(),
  })
  .optional();
// Define TodoListRelationFilter for use in where input
const TodoListRelationFilter = z
  .object({
    every: z.lazy(() => TodoWhereInput).optional(),
    some: z.lazy(() => TodoWhereInput).optional(),
    none: z.lazy(() => TodoWhereInput).optional(),
  })
  .optional();
const TodoRelationFilter = z
  .object({
    is: z.lazy(() => TodoWhereInput).optional(),
    isNot: z.lazy(() => TodoWhereInput).optional(),
  })
  .optional();
// Define UserListRelationFilter for use in where input
const UserListRelationFilter = z
  .object({
    every: z.lazy(() => UserWhereInput).optional(),
    some: z.lazy(() => UserWhereInput).optional(),
    none: z.lazy(() => UserWhereInput).optional(),
  })
  .optional();
const UserRelationFilter = z
  .object({
    is: z.lazy(() => UserWhereInput).optional(),
    isNot: z.lazy(() => UserWhereInput).optional(),
  })
  .optional();
// Define ListWhereInput
export const ListWhereInput: z.ZodType<unknown> = z.object({
  AND: z
      .union([
        z.lazy(() => ListWhereInput),
        z.array(z.lazy(() => ListWhereInput)),
      ])
      .optional(),
  OR: z.array(z.lazy(() => ListWhereInput)).optional(),
  NOT: z
      .union([
        z.lazy(() => ListWhereInput),
        z.array(z.lazy(() => ListWhereInput)),
      ])
      .optional(),
  id: z.union([z.string(), StringFilter]).optional(),
  createdAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  updatedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  owner: UserRelationFilter,
  ownerId: z.union([z.string(), StringFilter]).optional(),
  title: z.union([z.string(), StringFilter]).optional(),
  private: z.union([z.boolean(), BooleanFilter]).optional(),
  todos: TodoListRelationFilter,
});
// Define ListInclude schema for related records
export const ListInclude = z.object({
  owner: z.boolean().optional(),
  todos: z.boolean().optional(),
});
export const ListCreateNestedWithoutUserInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
title: z.string(),
private: z.boolean().optional(),
todos: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => TodoCreateNestedWithoutListInput))}),
      ]).optional(),
          });
export const ListCreateNestedWithoutTodoInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
title: z.string(),
private: z.boolean().optional(),
          });
export const ListCreateInput: z.ZodType<unknown> = z.object({
id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
title: z.string(),
private: z.boolean().optional(),
todos: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => TodoCreateNestedWithoutListInput))}),
      ]).optional(),
});
// Schema for update input data - reusing existing filters
export const ListUpdateInputSchema = z.object({
id: z.union([z.string(), StringFilter]).optional(),
createdAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
updatedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
ownerId: z.union([z.string(), StringFilter]).optional(),
title: z.union([z.string(), StringFilter]).optional(),
private: z.union([z.boolean(), BooleanFilter]).optional()
});
// Define the main ListFindManyArgs schema with where and include
export const ListFindManyArgsSchema = z
  .object({
    where: ListWhereInput.optional(),
    include: ListInclude.optional(),
  })
  .describe("Prisma client API `findMany` function args for List model");
export type ListFindManyArgsType = z.infer<typeof ListFindManyArgsSchema>;
// Schema for the ListCreateArgs
export const ListCreateArgsSchema = z
  .object({
    data: ListCreateInput,
  })
  .describe("Prisma client API `create` function args for List model");

export type ListCreateArgsSchemaType = z.infer<typeof ListCreateArgsSchema>;
// Schema for the ListUpdateArgs with data and where
export const ListUpdateArgsSchema = z
  .object({
    data: ListUpdateInputSchema,
    where: ListWhereInput,
  })
  .describe("Prisma client API `update` function args for List model");
// Type inference helper
export type ListUpdateArgsType = z.infer<typeof ListUpdateArgsSchema>;
// Define TodoWhereInput
export const TodoWhereInput: z.ZodType<unknown> = z.object({
  AND: z
      .union([
        z.lazy(() => TodoWhereInput),
        z.array(z.lazy(() => TodoWhereInput)),
      ])
      .optional(),
  OR: z.array(z.lazy(() => TodoWhereInput)).optional(),
  NOT: z
      .union([
        z.lazy(() => TodoWhereInput),
        z.array(z.lazy(() => TodoWhereInput)),
      ])
      .optional(),
  id: z.union([z.string(), StringFilter]).optional(),
  createdAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  updatedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  owner: UserRelationFilter,
  ownerId: z.union([z.string(), StringFilter]).optional(),
  list: ListRelationFilter,
  listId: z.union([z.string(), StringFilter]).optional(),
  title: z.union([z.string(), StringFilter]).optional(),
  completedAt: z.union([z.date().or(z.string()), DateTimeFilter, notNullFilter]).nullable().optional(),
}).optional();
// Define TodoInclude schema for related records
export const TodoInclude = z.object({
  owner: z.boolean().optional(),
  list: z.boolean().optional(),
});
export const TodoCreateNestedWithoutUserInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
list: z.union
      ([
          z.object({connect: z.object({id: z.string()})}),
          z.object({create: z.lazy(() => ListCreateNestedWithoutTodoInput)}),
      ]),
title: z.string(),
completedAt: z.date().or(z.string()).optional(),
          });
export const TodoCreateNestedWithoutListInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
title: z.string(),
completedAt: z.date().or(z.string()).optional(),
          });
export const TodoCreateInput: z.ZodType<unknown> = z.object({
id: z.string().optional(),
createdAt: z.date().or(z.string()).optional(),
updatedAt: z.date().or(z.string()).optional(),
list: z.union
      ([
          z.object({connect: z.object({id: z.string()})}),
          z.object({create: z.lazy(() => ListCreateNestedWithoutTodoInput)}),
      ]),
title: z.string(),
completedAt: z.date().or(z.string()).optional(),
});
// Schema for update input data - reusing existing filters
export const TodoUpdateInputSchema = z.object({
id: z.union([z.string(), StringFilter]).optional(),
createdAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
updatedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
ownerId: z.union([z.string(), StringFilter]).optional(),
listId: z.union([z.string(), StringFilter]).optional(),
title: z.union([z.string(), StringFilter]).optional(),
completedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional()
});
// Define the main TodoFindManyArgs schema with where and include
export const TodoFindManyArgsSchema = z
  .object({
    where: TodoWhereInput.optional(),
    include: TodoInclude.optional(),
  })
  .describe("Prisma client API `findMany` function args for Todo model");
export type TodoFindManyArgsType = z.infer<typeof TodoFindManyArgsSchema>;
// Schema for the TodoCreateArgs
export const TodoCreateArgsSchema = z
  .object({
    data: TodoCreateInput,
  })
  .describe("Prisma client API `create` function args for Todo model");

export type TodoCreateArgsSchemaType = z.infer<typeof TodoCreateArgsSchema>;
// Schema for the TodoUpdateArgs with data and where
export const TodoUpdateArgsSchema = z
  .object({
    data: TodoUpdateInputSchema,
    where: TodoWhereInput,
  })
  .describe("Prisma client API `update` function args for Todo model");
// Type inference helper
export type TodoUpdateArgsType = z.infer<typeof TodoUpdateArgsSchema>;
// Define UserWhereInput
export const UserWhereInput: z.ZodType<unknown> = z.object({
  AND: z
      .union([
        z.lazy(() => UserWhereInput),
        z.array(z.lazy(() => UserWhereInput)),
      ])
      .optional(),
  OR: z.array(z.lazy(() => UserWhereInput)).optional(),
  NOT: z
      .union([
        z.lazy(() => UserWhereInput),
        z.array(z.lazy(() => UserWhereInput)),
      ])
      .optional(),
  id: z.union([z.string(), StringFilter]).optional(),
  name: z.union([z.string(), StringFilter, notNullFilter]).nullable().optional(),
  email: z.union([z.string(), StringFilter, notNullFilter]).nullable().optional(),
  password: z.union([z.string(), StringFilter]).optional(),
  todo: TodoListRelationFilter,
  list: ListListRelationFilter,
}).optional();
// Define UserInclude schema for related records
export const UserInclude = z.object({
  todo: z.boolean().optional(),
  list: z.boolean().optional(),
});
export const UserCreateNestedWithoutTodoInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
name: z.string().optional(),
email: z.string().optional(),
password: z.string(),
list: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => ListCreateNestedWithoutUserInput))}),
      ]).optional(),
          });
export const UserCreateNestedWithoutListInput: z.ZodType<unknown> = z.object({
            id: z.string().optional(),
name: z.string().optional(),
email: z.string().optional(),
password: z.string(),
todo: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => TodoCreateNestedWithoutUserInput))}),
      ]).optional(),
          });
export const UserCreateInput: z.ZodType<unknown> = z.object({
id: z.string().optional(),
name: z.string().optional(),
email: z.string().optional(),
password: z.string(),
todo: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => TodoCreateNestedWithoutUserInput))}),
      ]).optional(),
list: z.union
      ([
          z.object({connect: z.array(z.object({id: z.string()}))}),
          z.object({create: z.array(z.lazy(() => ListCreateNestedWithoutUserInput))}),
      ]).optional(),
});
// Schema for update input data - reusing existing filters
export const UserUpdateInputSchema = z.object({
id: z.union([z.string(), StringFilter]).optional(),
name: z.union([z.string(), StringFilter]).optional(),
email: z.union([z.string(), StringFilter]).optional(),
password: z.union([z.string(), StringFilter]).optional()
});
// Define the main UserFindManyArgs schema with where and include
export const UserFindManyArgsSchema = z
  .object({
    where: UserWhereInput.optional(),
    include: UserInclude.optional(),
  })
  .describe("Prisma client API `findMany` function args for User model");
export type UserFindManyArgsType = z.infer<typeof UserFindManyArgsSchema>;
// Schema for the UserCreateArgs
export const UserCreateArgsSchema = z
  .object({
    data: UserCreateInput,
  })
  .describe("Prisma client API `create` function args for User model");

export type UserCreateArgsSchemaType = z.infer<typeof UserCreateArgsSchema>;
// Schema for the UserUpdateArgs with data and where
export const UserUpdateArgsSchema = z
  .object({
    data: UserUpdateInputSchema,
    where: UserWhereInput,
  })
  .describe("Prisma client API `update` function args for User model");
// Type inference helper
export type UserUpdateArgsType = z.infer<typeof UserUpdateArgsSchema>;

// Consolidated schema export for all models
export const allSchemas = {
  list: {
    findMany: ListFindManyArgsSchema,
    update: ListUpdateArgsSchema,
    create: ListCreateArgsSchema
  },
  todo: {
    findMany: TodoFindManyArgsSchema,
    update: TodoUpdateArgsSchema,
    create: TodoCreateArgsSchema
  },
  user: {
    findMany: UserFindManyArgsSchema,
    update: UserUpdateArgsSchema,
    create: UserCreateArgsSchema
  },
};

// Type for the consolidated schemas
export type AllSchemasType = typeof allSchemas;

// System prompt for the AI
export const systemPrompt = `
You are a Database CRUD operator. Based on the user's request to call the individual tools to perform CRUD operations of Prisma client API:

**Instructions:**
1. When invoking the query tools \`findMany\`, if user asks for "my" and "I", simply ignore it when generating query parameters.
`;
