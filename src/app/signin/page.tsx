"use client";

import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

const Signin: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onSignin(e: FormEvent) {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      alert("Signin failed");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white font-sans">
      <div className="w-full max-w-md px-8">
        <h1 className="mb-1 text-center text-3xl font-bold">Sign In</h1>
        <p className="mb-8 text-center text-gray-500">
          Use your email and password to sign in
        </p>

        <form className="space-y-6" onSubmit={(e) => void onSignin(e)}>
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
            Sign in
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don&apos;t have an account?</span>{" "}
          <Link
            href="/signup"
            className="font-medium text-black hover:underline"
          >
            Sign up
          </Link>{" "}
          <span className="text-gray-500">for free.</span>
        </div>
      </div>
    </div>
  );
};

export default Signin;
