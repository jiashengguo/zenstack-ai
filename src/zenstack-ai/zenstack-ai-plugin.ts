import {
  getIdFields,
  getRelationKeyPairs,
  hasAttribute,
  isAuthInvocation,
  isForeignKeyField,
  requireOption,
  type PluginOptions,
} from "@zenstackhq/sdk";
import {
  isDataModel,
  type DataModel,
  type Model,
  DataModelField,
  DataModelFieldAttribute,
} from "@zenstackhq/sdk/ast";
import fs from "fs";
import path from "path";
import { Project, SourceFile } from "ts-morph";
import { streamAst } from "langium";

export const name = "zenstack-ai";

export class PrismaCRUDGenerator {
  // Keep track of already defined relation filters to avoid duplicates
  private definedRelationFilters: Set<string> = new Set<string>();

  // Generate schemas using ts-morph
  public generateZodSchemas(dataModels: DataModel[]): Project {
    const project = new Project({
      skipAddingFilesFromTsConfig: true,
      useInMemoryFileSystem: true,
    });

    // Create a single file for all models
    const allModelsFile = project.createSourceFile("all-schemas.ts", "", {
      overwrite: true,
    });

    // Reset defined relation filters
    this.definedRelationFilters.clear();

    // Add imports to combined file
    allModelsFile.addImportDeclaration({
      moduleSpecifier: "zod",
      namedImports: ["z"],
    });

    // Define basic filter types directly in the all-schemas.ts file to match baseline
    this.addBasicFilterTypes(allModelsFile);

    // Add all relation filters dynamically based on the data models
    this.addAllRelationFilters(allModelsFile, dataModels);

    // Process each data model in the combined file
    for (const model of dataModels) {
      this.generateModelSchemas(allModelsFile, model);
    }

    return project;
  }

  // Add basic filter types directly to the all-schemas.ts file
  private addBasicFilterTypes(sourceFile: SourceFile): void {
    sourceFile.addStatements(`// Define schemas for basic field filters
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
});`);
  }

  // Add all relation filters dynamically based on the data models
  private addAllRelationFilters(
    sourceFile: SourceFile,
    dataModels: DataModel[],
  ): void {
    // Add ListRelationFilter for each model
    for (const model of dataModels) {
      const modelName = model.name;
      const listRelationFilterName = `${modelName}ListRelationFilter`;

      if (!this.definedRelationFilters.has(listRelationFilterName)) {
        sourceFile.addStatements(`// Define ${listRelationFilterName} for use in where input
const ${listRelationFilterName} = z
  .object({
    every: z.lazy(() => ${modelName}WhereInput).optional(),
    some: z.lazy(() => ${modelName}WhereInput).optional(),
    none: z.lazy(() => ${modelName}WhereInput).optional(),
  })
  .optional();`);
        this.definedRelationFilters.add(listRelationFilterName);
      }

      // Add regular relation filter for this model
      const relationFilterName = `${modelName}RelationFilter`;
      if (!this.definedRelationFilters.has(relationFilterName)) {
        sourceFile.addStatements(`const ${relationFilterName} = z
  .object({
    is: z.lazy(() => ${modelName}WhereInput).optional(),
    isNot: z.lazy(() => ${modelName}WhereInput).optional(),
  })
  .optional();`);
        this.definedRelationFilters.add(relationFilterName);
      }
    }
  }

  // Generate all schemas for a model
  private generateModelSchemas(sourceFile: SourceFile, model: DataModel): void {
    // Generate WhereInput schema for the model
    this.generateWhereInputSchema(sourceFile, model);

    // Generate Include schema for the model
    this.generateIncludeSchema(sourceFile, model);

    // Generate nested create input schema first that could be used in the main create input schema
    this.generateCreateInputSchema(sourceFile, model);

    // Generate update input schema for the model
    this.generateUpdateInputSchema(sourceFile, model);

    // Generate operation schemas for the model
    this.generateFindManyArgsSchema(sourceFile, model);
    this.generateCreateArgsSchema(sourceFile, model);
    this.generateUpdateArgsSchema(sourceFile, model);
  }

  // Generate WhereInput schema dynamically
  private generateWhereInputSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;
    // Add comment
    sourceFile.addStatements(`// Define ${modelName}WhereInput`);

    // Build the object properties based on the model fields
    const properties = [
      `AND: z
      .union([
        z.lazy(() => ${modelName}WhereInput),
        z.array(z.lazy(() => ${modelName}WhereInput)),
      ])
      .optional(),`,
      `OR: z.array(z.lazy(() => ${modelName}WhereInput)).optional(),`,
      `NOT: z
      .union([
        z.lazy(() => ${modelName}WhereInput),
        z.array(z.lazy(() => ${modelName}WhereInput)),
      ])
      .optional(),`,
    ];

    // Add fields
    for (const field of model.fields) {
      let filterType = "";
      const fieldName = field.name;
      // Skip relation fields, they'll be handled separately
      if (isDataModel(field.type.reference?.ref)) {
        const typeName = field.type.reference.$refText;
        if (field.type.array) {
          filterType = `${typeName}ListRelationFilter`;
        } else {
          filterType = `${typeName}RelationFilter`;
        }
      } else {
        filterType = this.getFieldZodProperty(field, true);
      }
      properties.push(`${fieldName}: ${filterType},`);
    }

    sourceFile.addStatements(
      `export const ${modelName}WhereInput: z.ZodType<unknown> = z.object({
  ${properties.join("\n  ")}
})${modelName !== "List" ? ".optional()" : ""};`,
    );
  }

  private getFieldZodTypeAndFilter(field: DataModelField) {
    switch (field.type.type) {
      case "String":
        return {
          zodType: "z.string()",
          filterType: "StringFilter",
        };
      case "Boolean":
        return {
          zodType: "z.boolean()",
          filterType: "BooleanFilter",
        };
      case "DateTime":
        return {
          zodType: "z.date().or(z.string())",
          filterType: "DateTimeFilter",
        };
      case "Int":
      case "Float":
        return {
          zodType: "z.number()",
          filterType: "IntFilter",
        };
      default:
        return {
          zodType: "z.string()",
          filterType: "StringFilter",
        };
    }
  }

  // Helper to determine filter schema for a field
  private getFieldZodProperty(
    field: DataModelField,
    isInWhereInput: boolean,
  ): string {
    const isNullable = field.type.optional;
    // Define a template for filter type with placeholders
    const filterTemplate = (zodType: string, filterType: string) =>
      `z.union([${zodType}, ${filterType}${isInWhereInput && isNullable ? ", notNullFilter" : ""}])${isInWhereInput && isNullable ? ".nullable()" : ""}.optional()`;

    const { zodType, filterType } = this.getFieldZodTypeAndFilter(field);
    return filterTemplate(zodType, filterType);
  }

  // Generate Include schema for relations
  private generateIncludeSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;

    // Only export relations for models that have them
    const hasRelations = model.fields.some((field) =>
      isDataModel(field.type.reference?.ref),
    );
    if (!hasRelations) return;

    // Add comment
    sourceFile.addStatements(
      `// Define ${modelName}Include schema for related records`,
    );

    // Build include properties based on relations
    const includeProps = model.fields
      .filter((field) => isDataModel(field.type.reference?.ref))
      .map((field) => `  ${field.name}: z.boolean().optional(),`)
      .join("\n");

    // Add the Include schema declaration
    sourceFile.addStatements(`export const ${modelName}Include = z.object({
${includeProps}
});`);
  }

  private getCreateInputProps(model: DataModel, ignoreFields: string[] = []) {
    const modelName = model.name;
    const createProps = [];
    const fields = model.fields.filter((f) => {
      if (ignoreFields.includes(f.name)) return false;

      if (isForeignKeyField(f)) return false;

      const relationKeyPairs = getRelationKeyPairs(f);
      if (
        relationKeyPairs.some(({ foreignKey }) =>
          foreignKey.attributes.some((attr) => this.isDefaultWithAuth(attr)),
        )
      ) {
        return false;
      }

      return true;
    });

    // Add scalar fields
    for (const field of fields) {
      let fieldType = "";
      const fieldName = field.name;

      if (isDataModel(field.type.reference?.ref)) {
        const isArray = field.type.array;

        // create property
        const nestedCreateSchemaName = `z.lazy(() => ${field.type.reference.$refText}CreateNestedWithout${modelName}Input)`;

        const createProp = isArray
          ? `z.array(${nestedCreateSchemaName})`
          : `${nestedCreateSchemaName}`;

        // connect property

        const refModel = field.type.reference.ref;
        const idFields = getIdFields(refModel) as DataModelField[];
        const uniqueFields = refModel.fields.filter((x) =>
          hasAttribute(x, "@unique"),
        );

        let uniqueInput = `z.object({${idFields.map((field) => `${field.name}: ${this.getFieldZodTypeAndFilter(field).zodType}`).join(",\n")}})`;

        if (uniqueFields.length > 0) {
          uniqueInput += `.or(${uniqueFields.map((field) => `z.object({${field.name}: ${this.getFieldZodTypeAndFilter(field).zodType}})`).join(".or")})`;
        }
        const connectProp = isArray ? `z.array(${uniqueInput})` : uniqueInput;

        const connectOrCreateProp = `z.union
      ([
          z.object({connect: ${connectProp}}),
          z.object({create: ${createProp}}),
      ])`;

        createProps.push(
          `${fieldName}: ${connectOrCreateProp}${isArray ? ".optional()" : ""},`,
        );
      } else {
        fieldType = this.getFieldZodTypeAndFilter(field).zodType;

        const isFieldWithDefault =
          hasAttribute(field, "@default") ||
          hasAttribute(field, "@updatedAt") ||
          field.type.optional;

        createProps.push(
          `${field.name}: ${fieldType}${isFieldWithDefault ? ".optional()" : ""},`,
        );
      }
    }

    return createProps;
  }

  // Generate create input schema for relations
  private generateCreateInputSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;

    this.generateNestedCreateInputSchemas(sourceFile, model);
    // Build create input properties
    const createProps = this.getCreateInputProps(model);

    // Add the create input schema
    sourceFile.addStatements(`export const ${modelName}CreateInput: z.ZodType<unknown> = z.object({
${createProps.join("\n")}
});`);
  }

  // Generate nested create input schemas for related models
  private generateNestedCreateInputSchemas(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    // find all relation fields
    model.fields
      .filter((field) => isDataModel(field.type.reference?.ref))
      .forEach((field) => {
        // for each relation field, create a nested create input schema omit this field
        const refModelName = field.type.reference!.$refText;
        const nestedCreateSchemaName = `${model.name}CreateNestedWithout${refModelName}Input`;

        const createProps = this.getCreateInputProps(model, [field.name]);

        sourceFile.addStatements(
          `export const ${nestedCreateSchemaName}: z.ZodType<unknown> = z.object({
            ${createProps.join("\n")}
          });`,
        );
      });
  }

  // Generate update input schema
  private generateUpdateInputSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;

    // Build update properties
    const updateProps = model.$allFields
      ?.filter((field) => !isDataModel(field.type.reference?.ref))
      .map(
        (field) => `${field.name}: ${this.getFieldZodProperty(field, false)}`,
      );

    // Add the UpdateInputSchema
    sourceFile.addStatements(`// Schema for update input data - reusing existing filters
export const ${modelName}UpdateInputSchema = z.object({
${updateProps!.join(",\n")}
});`);
  }

  // Generate FindManyArgs schema
  private generateFindManyArgsSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;
    const hasInclude = model.fields.some((field) =>
      isDataModel(field.type.reference?.ref),
    );

    // Add comment
    sourceFile.addStatements(
      `// Define the main ${modelName}FindManyArgs schema with where and include`,
    );

    // Add the FindManyArgs schema declaration with export
    let schema = `export const ${modelName}FindManyArgsSchema = z
  .object({
    where: ${modelName}WhereInput.optional(),`;

    if (hasInclude) {
      schema += `
    include: ${modelName}Include.optional(),`;
    }

    schema += `
  })
  .describe("prisma client FindManyArgs for ${modelName} model");
export type ${modelName}FindManyArgsType = z.infer<typeof ${modelName}FindManyArgsSchema>;`;

    sourceFile.addStatements(schema);
  }

  // Generate CreateArgs schema
  private generateCreateArgsSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;

    // Add the CreateArgs schema declaration with export
    sourceFile.addStatements(`// Schema for the ${modelName}CreateArgs
export const ${modelName}CreateArgsSchema = z
  .object({
    data: ${modelName}CreateInput,
  })
  .describe("\`create\` function of Prisma client API for ${modelName} model");

export type ${modelName}CreateArgsSchemaType = z.infer<typeof ${modelName}CreateArgsSchema>;`);
  }

  // Generate UpdateArgs schema
  private generateUpdateArgsSchema(
    sourceFile: SourceFile,
    model: DataModel,
  ): void {
    const modelName = model.name;

    // Add the UpdateArgs schema declaration with export
    sourceFile.addStatements(`// Schema for the ${modelName}UpdateArgs with data and where
export const ${modelName}UpdateArgsSchema = z
  .object({
    data: ${modelName}UpdateInputSchema,
    where: ${modelName}WhereInput,
  })
  .describe("prisma client update function args for ${modelName} model");
// Type inference helper
export type ${modelName}UpdateArgsType = z.infer<typeof ${modelName}UpdateArgsSchema>;`);
  }

  private isDefaultWithAuth(attr: DataModelFieldAttribute): boolean {
    if (attr.decl.ref?.name !== "@default") {
      return false;
    }

    const expr = attr.args[0]?.value;
    if (!expr) {
      return false;
    }

    // find `auth()` in default value expression
    return streamAst(expr).some(isAuthInvocation);
  }
}

export default async function generate(model: Model, options: PluginOptions) {
  // Process options
  const outputDir = requireOption<string>(options, "output", name);

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
