"use client";

import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCreateUser } from "~/lib/hooks";
import Link from "next/link";

const Signup: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync: signup } = useCreateUser();
  const router = useRouter();

  async function onSignup(e: FormEvent) {
    e.preventDefault();
    try {
      await signup({ data: { email, password } });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (err.info?.prisma && err.info?.code === "P2002") {
        // P2002 is Prisma's error code for unique constraint violations
        alert("User already exists");
      } else {
        alert("An unknown error occurred");
      }
      return;
    }

    // signin to create a session
    await signIn("credentials", { redirect: false, email, password });
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md px-8">
        <h1 className="mb-1 text-center text-3xl font-bold">Sign Up</h1>
        <p className="mb-8 text-center text-gray-500">
          Create an account with your email and password
        </p>
        <form className="space-y-6" onSubmit={(e) => void onSignup(e)}>
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Sign up
          </button>
        </form>
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Already have an account?</span>{" "}
          <Link
            href="/signin"
            className="font-medium text-black hover:underline"
          >
            Sign in
          </Link>{" "}
          <span className="text-gray-500">instead.</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
