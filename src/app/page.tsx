"use client";

import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";

type AuthUser = { id: string; email?: string | null };

const Welcome = ({ user }: { user: AuthUser }) => {
  const router = useRouter();
  async function onSignout() {
    await signOut({ redirect: false });
    router.push("/signin");
  }
  return (
    <div className="flex gap-4">
      <h3 className="text-lg">Welcome back, {user?.email}</h3>
      <button
        className="text-gray-300 underline"
        onClick={() => void onSignout()}
      >
        Signout
      </button>
    </div>
  );
};

const SigninSignup = () => {
  return (
    <div className="flex gap-4 text-2xl">
      <Link href="/signin" className="rounded-lg border px-4 py-2">
        Signin
      </Link>
      <Link href="/signup" className="rounded-lg border px-4 py-2">
        Signup
      </Link>
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading ...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-white">
        <h1 className="text-5xl font-extrabold">My Awesome Blog</h1>

        {session?.user ? (
          // welcome & blog posts
          <div className="">
            <Welcome user={session.user} />
            <section className="mt-10"></section>
            <div className="ring-none mx-auto flex h-svh max-h-svh w-full flex-col items-stretch border-none">
              <Chat />
            </div>
          </div>
        ) : (
          // if not logged in
          <SigninSignup />
        )}
      </div>
    </main>
  );
};

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === "user" ? "User: " : "AI: "}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm text-black file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}

export default Home;
