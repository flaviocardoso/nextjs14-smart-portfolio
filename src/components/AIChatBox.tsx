import { cn } from "@/lib/utils";
import { Message, useChat } from "ai/react";
import { Bot, SendHorizonal, Trash, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";

interface AIChatBoxProps {
  open: boolean;
  setClose: () => void;
}

export default function AIChatBox({ open, setClose }: AIChatBoxProps) {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = useChat(); // api/chat
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);
  const lastMessageIsUser = messages[messages.length - 1]?.role === "user";
  return (
    <div
      className={cn(
        "bottom-0 right-0 z-50 w-full max-w-[500px] p-1 xl:right-36",
        open ? "fixed" : "hidden",
      )}
    >
      <button onClick={setClose} className="mb-1 ms-auto block">
        <XCircle size={30} className="rounded-full bg-background" />
      </button>
      <div className="flex flex-col h-[600px] rounded border bg-background shadow-xl">
        <div ref={scrollRef} className="mt-3 h-full overflow-y-auto px-3">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && lastMessageIsUser && (
            <ChatMessage
              message={{
                id: "loding",
                role: "assistant",
                content: "Pensando...",
              }}
            />
          )}
          {error && (
            <ChatMessage
              message={{
                id: "error",
                role: "assistant",
                content: "Algo está errado. Por favor tente de novo.",
              }}
            />
          )}
          {!error && messages.length === 0 && (
            <div className="flex flex-col h-full items-center justify-center gap-3 text-center mx-8">
              <Bot size={28} />
              <p className="text-lg font-medium">
                Envie uma mensagem para iniciar o chat AI!
              </p>
              <p>
                Você pode perguntar ao chat AI qualquer pergunta sobre mim e ele
                irá encontrar a informação relevante deste site.
              </p>
              <p className="text-sm text-muted-foreground">
                Nota: Se você quiser aprender como se contrui seu próprio
                chatbot AI, veja o tutorial em{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://www.youtube.com/@codinginflow"
                >
                  Coding in Flow no Youtube
                </a>
              </p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="m-3 flex gap-1">
          <button
            type="button"
            title="Clear chat"
            onClick={() => setMessages([])}
            className="flex items-center justify-center w-10 flex-none"
          >
            <Trash size={24} />
          </button>
          <input ref={inputRef}
            value={input}
            onChange={handleInputChange}
            placeholder="Diga alguma coisa..."
            className="grow border rounded bg-background px-3 py-2"
          />
          <button
            type="submit"
            title="Submit message"
            className="flex items-center justify-center w-10 flex-none disabled:opacity-50"
            disabled={input.length === 0}
          >
            <SendHorizonal size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message: { role, content } }: ChatMessageProps) {
  const isAIMessage = role === "assistant";
  return (
    <div
      className={cn(
        "mb-3 flex items-center",
        isAIMessage ? "me-5 justify-start" : "ms-5 justify-end",
      )}
    >
      {isAIMessage && <Bot className="mr-2 flex-none" />}
      <div
        className={cn(
          "rounded-md border px-3 py-2",
          isAIMessage ? "bg-background" : "bg-foreground text-background",
        )}
      >
        <ReactMarkdown
          components={{
            a: ({ node, ref, ...props }) => (
              <Link
                {...props}
                href={props.href ?? ""}
                className="text-primary hover:underline"
              />
            ),
            p: ({ node, ...props }) => (
              <p {...props} className="mt-3 first:mt-0" />
            ),
            ul: ({ node, ...props }) => (
              <ul
                {...props}
                className="mt-3 list-inside list-disc first:mt-0"
              />
            ),
            li: ({ node, ...props }) => <li {...props} className="mt-1" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
