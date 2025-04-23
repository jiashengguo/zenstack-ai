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
    <div className="flex min-h-screen flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md rounded bg-white p-8 shadow">
        <h1 className="mb-2 text-center text-2xl font-bold leading-tight tracking-tight text-black">
          Sign In
        </h1>
        <p className="mb-8 text-center text-base leading-tight text-gray-500">
          Use your email and password to sign in
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => void onSignin(e)}
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="user@acme.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="rounded border border-gray-300 bg-gray-100 p-2 text-base focus:border-black focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="rounded border border-gray-300 bg-gray-100 p-2 text-base focus:border-black focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded bg-black py-2 text-base font-semibold text-white transition hover:bg-gray-800"
          >
            Sign in
          </button>
        </form>
        <div className="mt-6 text-center text-base text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-black hover:underline"
          >
            Sign up
          </Link>{" "}
          for free.
        </div>
      </div>
    </div>
  );
};

export default Signin;
