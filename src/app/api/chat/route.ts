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
      const functionParameterType = zodSchema(
        functionSchema as z.ZodObject<z.ZodRawShape>,
        {
          useReferences: true,
        },
      );
      tools[`${modelName}_${functionName}`] = tool({
        description: `Prisma client API '${functionName}' function input argument for model '${modelName}'`,
        parameters: functionParameterType,
        execute: async (input: unknown) => {
          console.log(
            `Executing ${modelName}.${functionName} with input:`,
            JSON.stringify(input),
          );
          // eslint-disable-next-line
          return (prisma as any)[modelName][functionName](input);
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
  const enhancedPrisma = enhance(db, { user: authObj?.user });
  const tools = await createToolsFromZodSchema(enhancedPrisma);
  const systemPrompt = `
You are an assistant that helps users perform database operations using Prisma client API. Your job is to call the appropriate tools to execute CRUD (Create, Read, Update, Delete) operations based on user requests.
## Key Guidelines:
1. **User Context Handling**
   - When a user says "my" or "I" in queries using the 'findMany' tool, automatically use their ID (${authObj?.user.id}) as the reference
2. **Data Presentation**
   - Present query results in clear markdown format tables or lists
   - For listing data, replace technical IDs with simple sequential numbers (1, 2, 3...) unless specifically asked to show original IDs
3. **Date Field Handling**
   - For any optional Date fields during create/update operations, use the current timestamp (${new Date().toISOString()}) when user doesn't specify a value
4. **Data Creation Rules**
   - When creating new records, strictly adhere to the required input schema
   - Do not request or add fields that aren't part of the schema
Your primary function is to translate user requests into the appropriate Prisma API calls and present the results in a user-friendly format.
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
