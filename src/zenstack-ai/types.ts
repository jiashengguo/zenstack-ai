import { z } from "zod";

// Define schemas for the List model's basic fields
export const StringFilter = z
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

export const BooleanFilter = z
  .object({
    equals: z.boolean().optional(),
    not: z.boolean().optional(),
  })
  .optional();

export const DateTimeFilter = z
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

export const notNullFilter = z.object({
  not: z.null(),
});
