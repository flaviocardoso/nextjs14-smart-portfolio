import { H1 } from "@/components/ui/H1";
import { H2 } from "@/components/ui/H2";
import { Bot } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flavio Cardoso - My Smart Protfolio",
};
export default function Home() {
  return (
    <section className="space-y-16 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat px-1 py-8">
      <section className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
        <div className="space-y-3">
          <H1 className="text-center sm:text-start">{`Hi, I'm Flavio 👋🏻`}</H1>
          <p className="text-center sm:text-start">
            {`I'm a full-stack developer from Brazil. I'm learning to create projects nextjs with Coding in Flow on Youtube.`}
          </p>
        </div>
        <div className="flex justify-center">
          {/*
           * Uma imagem sobre mim
           * Imagem 300x300
           * class - rounded-full aspect-square border-2 object-cover shadom-md dark:border-foreground
           * */}
          <div className="w-[300px] h-[300px] rounded-full aspect-square border-2 object-cover shadom-md dark:border-foreground"></div>
        </div>
      </section>
      <section className="space-y-3 text-center">
        <H2>Ask the chatbot anything about me.</H2>
        <p>
          Click the little <Bot className="inline pb-1" /> icon in the tob bar
          to activate the AI chat. You can ask the chatbot any question about me 
          and it will find the relevant info on this website. The bot can even
          provide links to pages {`you're`} looking for.
        </p>
      </section>
    </section>
  );
}
