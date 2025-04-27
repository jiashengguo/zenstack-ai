"use client";

import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Copy, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { useRef, useEffect } from "react";
import { Markdown } from "../components/markdown";

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  async function onSignout() {
    try {
      await signOut({
        redirect: false,
        callbackUrl: "/signin",
      });
      router.push("/signin");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading ...</p>;

  return (
    <main className="flex h-screen w-full overflow-hidden bg-white">
      {session?.user && (
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-gray-300 underline"
            onClick={() => void onSignout()}
          >
            Signout
          </Button>
        </div>
      )}

      {/* Chat Area */}
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        {/* Fixed Header */}
        <header className="flex h-14 shrink-0 items-center justify-center border-b px-4 py-2">
          <h1 className="text-lg font-semibold text-gray-900">
            ZenStack AI Chat
          </h1>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-32 pt-8">
          {session?.user ? <Chat /> : null}
        </div>
      </div>
    </main>
  );
};

function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="mx-auto w-full max-w-xl">
        <div className="mt-2 flex flex-col gap-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2">
              {message.role === "user" ? (
                <div className="ml-auto flex items-center gap-2">
                  <span className="max-w-xs break-words rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white">
                    {message.content}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="max-w-xs break-words rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-900">
                    <Markdown>{message.content}</Markdown>
                  </span>
                  <div className="mt-1 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input Box */}
        <div className="absolute bottom-0 left-0 right-0 bg-white">
          <div className="mx-auto max-w-xl px-4 pb-8 pt-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1"
            >
              <Input
                ref={inputRef}
                name="prompt"
                value={input}
                onChange={handleInputChange}
                placeholder="Send a message..."
                className="border-none bg-transparent text-gray-900 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 rounded-full bg-gray-900 p-1 text-white hover:bg-gray-800"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
