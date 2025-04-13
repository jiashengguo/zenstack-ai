import { z } from "zod";

// Define schemas for the List model's basic fields
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

// Define TodoRelationFilter for use in List where input
const TodoListRelationFilter = z
  .object({
    every: z.lazy(() => TodoWhereInput).optional(),
    some: z.lazy(() => TodoWhereInput).optional(),
    none: z.lazy(() => TodoWhereInput).optional(),
  })
  .optional();

const ListListRelationFilter = z
  .object({
    every: z.lazy(() => ListWhereInput).optional(),
    some: z.lazy(() => ListWhereInput).optional(),
    none: z.lazy(() => ListWhereInput).optional(),
  })
  .optional();

// Define UserRelationFilter for the owner relation
const UserRelationFilter = z
  .object({
    is: z.lazy(() => UserWhereInput).optional(),
    isNot: z.lazy(() => UserWhereInput).optional(),
  })
  .optional();

const ListRelationFilter = z
  .object({
    is: z.lazy(() => ListWhereInput).optional(),
    isNot: z.lazy(() => ListWhereInput).optional(),
  })
  .optional();

// Define TodoWhereInput (simplified)
const TodoWhereInput: z.ZodType<unknown> = z
  .object({
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
    title: z.union([z.string(), StringFilter]).optional(),
    completedAt: z
      .union([z.date(), DateTimeFilter, notNullFilter])
      .nullable()
      .optional(),
    owner: UserRelationFilter,
    ownerId: z.union([z.string(), StringFilter]).optional(),
    list: ListRelationFilter,
    listId: z.union([z.string(), StringFilter]).optional(),
  })
  .optional();

// Define UserWhereInput (simplified)
const UserWhereInput: z.ZodType<unknown> = z
  .object({
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
    name: z
      .union([z.string(), StringFilter, notNullFilter])
      .nullable()
      .optional(),
    email: z
      .union([z.string(), StringFilter, notNullFilter])
      .nullable()
      .optional(),
    todo: TodoListRelationFilter,
    list: ListListRelationFilter,
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

// Define the main ListFindManyArgs schema with only where and include
export const ListFindManyArgsSchema = z
  .object({
    where: ListWhereInput.optional(),
    include: ListInclude.optional(),
  })
  .describe("prisma client FindManyArgs for List model");

export type ListFindManyArgsType = z.infer<typeof ListFindManyArgsSchema>;

// Define the Todo schema for nested operations
const todoCreateInputSchema = z.object({
  id: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  title: z.string(),
  completedAt: z.union([z.date(), z.string(), z.null()]).optional(),
});

// Schema for unchecked create input (used when already have the ownerId)
export const ListCreateInputSchema = z.object({
  id: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
  title: z.string(),
  private: z.boolean().optional(),
  todos: z
    .object({
      create: z.union([todoCreateInputSchema, z.array(todoCreateInputSchema)]),
      connectOrCreate: z
        .array(
          z.object({
            where: z.object({ id: z.string() }),
            create: todoCreateInputSchema,
          }),
        )
        .optional(),
      connect: z.array(z.object({ id: z.string() })).optional(),
    })
    .optional(),
});

// Schema for the ListCreateArgs
export const listCreateArgsSchema = z
  .object({
    data: ListCreateInputSchema,
  })
  .describe("`create` function of Prisma client API for List model");

// Type inference helpers
export type ListUncheckedCreateInput = z.infer<typeof ListCreateInputSchema>;
export type ListCreateArgs = z.infer<typeof listCreateArgsSchema>;

// Schema for update input data - reusing existing filters
export const ListUpdateInputSchema = z.object({
  id: z.union([z.string(), StringFilter]).optional(),
  createdAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  updatedAt: z.union([z.date().or(z.string()), DateTimeFilter]).optional(),
  ownerId: z.union([z.string(), StringFilter]).optional(),
  title: z.union([z.string(), StringFilter]).optional(),
  private: z.union([z.boolean(), BooleanFilter]).optional(),
});

// Schema for the ListUpdateArgs with only data and where
export const ListUpdateArgsSchema = z
  .object({
    data: ListUpdateInputSchema,
    where: ListWhereInput,
  })
  .describe("prisma client update function args for List model");

// Type inference helper
export type ListUpdateArgsType = z.infer<typeof ListUpdateArgsSchema>;
