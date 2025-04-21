import { PluginOptions, requireOption } from "@zenstackhq/sdk";
import { Model, DataModel, isDataModel } from "@zenstackhq/sdk/ast";
import path from "path";
import { PrismaCRUDGenerator } from "./zenstack-ai-plugin";
import fs from "fs";

export const name = "zenstack-ai";

export default async function run(model: Model, options: PluginOptions) {
  // Process options
  const outputDir = (options.output as string) || "./zenstack-ai";

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get all data models
  const dataModels = model.declarations.filter((x): x is DataModel =>
    isDataModel(x),
  );

  // Create the generator instance
  const generator = new PrismaCRUDGenerator();

  // Generate the Zod schemas using ts-morph
  const project = generator.generateZodSchemas(dataModels);

  // Ensure the output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the combined schemas file
  const allSchemasFile = project.getSourceFile("all-schemas.ts");
  if (allSchemasFile) {
    fs.writeFileSync(
      path.join(outputDir, "all-schemas.ts"),
      allSchemasFile.getFullText(),
    );
    console.log(
      `Generated all model schemas at ${path.join(outputDir, "all-schemas.ts")}`,
    );
  }
}
