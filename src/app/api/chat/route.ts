import { type CoreMessage, streamText, type Tool, tool, zodSchema } from "ai";
import { openai } from "@ai-sdk/openai";
import { type z } from "zod";
import { db } from "~/server/db";
import { allSchemas, systemPrompt } from "../../../../crud-zod";
import { enhance, type PrismaClient } from "@zenstackhq/runtime";
import { auth } from "../../../server/auth";

// Allow streaming responses up to 30 seconds
export const maxDuration = 10;

async function getPrisma() {
  const authObj = await auth();
  console.log("authObj", JSON.stringify(authObj));
  return enhance(db, { user: authObj?.user });
}

async function createToolsFromSchema(prisma: PrismaClient) {
  const tools: Record<string, Tool> = {};

  for (const [modelName, functions] of Object.entries(allSchemas)) {
    for (const [functionName, functionSchema] of Object.entries(functions)) {
      const zodType = functionSchema as z.ZodObject<z.ZodRawShape>;
      const recursiveType = zodSchema(zodType, {
        useReferences: true,
      });
      tools[`${modelName}${functionName}`] = tool({
        description: zodType.description,
        parameters: recursiveType,
        execute: async (input: unknown) => {
          console.log(
            `Executing ${modelName}${functionName} with input:`,
            JSON.stringify(input),
          );
          // eslint-disable-next-line
          const result = (prisma as any)[modelName][functionName](input);
          // eslint-disable-next-line
          return result;
        },
      });
    }
  }
  return tools;
}

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const prisma = await getPrisma();
  const tools = await createToolsFromSchema(prisma);

  const result = streamText({
    model: openai("gpt-4"),
    system: systemPrompt,
    messages,
    maxSteps: 3,
    tools: tools,
  });

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler,
  });
}

function errorHandler(error: unknown) {
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
