"use client";

import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { signupAction } from "./actions";

const Signup: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onSignup(e: FormEvent) {
    e.preventDefault();
    try {
      await signupAction({ email, password });
      // Then sign in to create a session
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        router.push("/");
      } else {
        alert("Failed to sign in after account creation");
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      alert(errorMessage);
    }
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
