"use server";

import { z } from "zod";
import { db } from "~/server/db";
import { hashSync } from "bcryptjs";
import { Prisma } from "@prisma/client";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function signupAction(formData: {
  email: string;
  password: string;
}) {
  try {
    signupSchema.parse(formData);
    const user = await db.user.create({
      data: {
        email: formData.email,
        password: hashSync(formData.password),
      },
    });
    console.log("User created:", user);
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new Error("User already exists");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
