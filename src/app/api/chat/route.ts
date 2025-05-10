import { type CoreMessage, streamText, type Tool, tool, zodSchema } from "ai";
import { openai } from "@ai-sdk/openai";
import { type z } from "zod";
import { db } from "~/server/db";
import { enhance, type PrismaClient } from "@zenstackhq/runtime";
import { auth } from "../../../server/auth";
import prismaInputSchema from "@zenstackhq/runtime/zod/input";

// Allow streaming responses up to 30 seconds
export const maxDuration = 10;

async function createToolsFromZodSchema(prisma: PrismaClient) {
  const tools: Record<string, Tool> = {};

  const functionNames = ["findMany", "createMany", "deleteMany", "updateMany"];

  for (const [inputTypeName, functions] of Object.entries(prismaInputSchema)) {
    // remove the postfix InputSchema from the model name
    const modelName = inputTypeName.replace("InputSchema", "");

    for (const [functionName, functionSchema] of Object.entries(
      functions,
    ).filter((x) => functionNames.includes(x[0]))) {
      const zodType = functionSchema as z.ZodObject<z.ZodRawShape>;
      const recursiveType = zodSchema(zodType, {
        useReferences: true,
      });
      tools[`${modelName}_${functionName}`] = tool({
        description: `Prisma client API '${functionName}' function input argument for model '${modelName}'`,
        parameters: recursiveType,
        execute: async (input: unknown) => {
          console.log(
            `Executing ${modelName}.${functionName} with input:`,
            JSON.stringify(input),
          );
          /* eslint-disable */
          const result = (prisma as any)[modelName][functionName](input);
          return result;
          /* eslint-enable */
        },
      });
    }
  }

  return tools;
}

export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const authObj = await auth();
  console.log("authObj", JSON.stringify(authObj));
  const enhancedPrisma = enhance(db, { user: authObj?.user });
  const tools = await createToolsFromZodSchema(enhancedPrisma);
  const systemPrompt = `
You are a application operation assistant. Based on the user's request to call the individual tools to perform CRUD operations of Prisma client API:

**Instructions:**
1. When invoking the query tools 'findMany', if user asks for "my" and "I", the current userId is ${authObj?.user.id}
2. If the response contains the data of query, use markdown format to display the data clearly.
3. When display the list of data, don't display original id of the model unless user asks for it. Use the natural number starting from 1 instead.
4. When create or update data for 'Date' optional field, set it to '${new Date().toISOString()}' if user doesn't provide value.
5. When create new record, strictly follow the input schema, don't ask or add any other fields.
`;

  const result = streamText({
    model: openai("gpt-4.1"),
    system: systemPrompt,
    messages: messages,
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
