import { type CoreMessage, streamText, tool } from "ai";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { db } from "~/server/db";
import { Prisma, PrismaClient } from "@prisma/client";
import { equal } from "assert";
import {
  ListCreateArgs,
  listCreateArgsSchema,
  ListFindManyArgsSchema,
  ListFindManyArgsType,
} from "../../../types/list-find-many-args";
import { enhance } from "@zenstackhq/runtime";
import { auth } from "../../../server/auth";

// Allow streaming responses up to 30 seconds
export const maxDuration = 10;

async function getPrisma() {
  const authObj = await auth();
  console.log("authObj", JSON.stringify(authObj));
  return enhance(db, { user: authObj?.user });
}

//#region old post
// Base where schema for Post model filters
const PostWhereInput = z
  .object({
    id: z
      .union([
        z.number(),
        z.object({
          equals: z.number().optional(),
          in: z.array(z.number()).optional(),
          notIn: z.array(z.number()).optional(),
          lt: z.number().optional(),
          lte: z.number().optional(),
          gt: z.number().optional(),
          gte: z.number().optional(),
        }),
      ])
      .optional(),

    name: z
      .union([
        z.string(),
        z.object({
          contains: z.string().optional(),
          startsWith: z.string().optional(),
          endsWith: z.string().optional(),
          equals: z.string().optional(),
          in: z.array(z.string()).optional(),
        }),
      ])
      .optional(),

    createdById: z
      .union([
        z.string(),
        z.object({
          equals: z.string().optional(),
          in: z.array(z.string()).optional(),
          notIn: z.array(z.string()).optional(),
        }),
      ])
      .optional(),

    // Relation filter for User
    createdBy: z
      .object({
        // User model filters
        id: z.string().optional(),
        name: z.string().optional(),
        email: z.string().optional(),

        // Add more User fields as needed
      })
      .optional(),
  })
  .strict();

// Include schema for relations
const PostIncludeInput = z
  .object({
    createdBy: z.boolean().optional(),
  })
  .strict();

// Final combined schema
export const PostFindManyParams = z.object({
  where: PostWhereInput.optional(),
  include: PostIncludeInput.optional(),
});

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const prisma = await getPrisma();

  const result = streamText({
    model: openai("gpt-4"),
    system: "You are a helpful assistant.",
    messages,
    maxSteps: 3,
    tools: {
      findPost: tool({
        description: "Get the todo list",
        parameters: ListFindManyArgsSchema,
        execute: async (input: ListFindManyArgsType) => {
          console.log("Input:", JSON.stringify(input));

          const list = prisma.list.findMany(input as Prisma.ListFindManyArgs);

          return list;
        },
      }),
      createList: tool({
        description: "Create a new todo list.",
        parameters: listCreateArgsSchema,
        execute: async (input: ListCreateArgs) => {
          const list = prisma.list.create(input as Prisma.ListCreateArgs);

          console.log("Created list:", JSON.stringify(input));

          return list;
        },
      }),
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}

export function errorHandler(error: unknown) {
  console.error("Error:", error);
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}
