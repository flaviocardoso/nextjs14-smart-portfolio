// import OpenAI from "openai";
import {
  LangChainStream,
  Message as VercelChatMessage,
  OpenAIStream,
  StreamingTextResponse,
} from "ai";
// import { ChatCompletionMessageParam } from "ai/prompts";
import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  PromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { getVectorStore } from "@/lib/astradb";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { UpstashRedisCache } from "langchain/cache/upstash_redis";
import { Redis } from "@upstash/redis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = body.messages;
    // const openai = new OpenAI();
    // const systemMessage: ChatCompletionMessageParam = {
    //   role: "system",
    //   content: "Teste para entrada do sistema.",
    // };
    // const response = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo",
    //   stream: true,
    //   messages: [systemMessage, ...messages],
    // });
    // const stream = OpenAIStream(response);
    const retriever = (await getVectorStore()).asRetriever();
    const chatHistory = messages
      .slice(0, -1)
      .map((msg: VercelChatMessage) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      );
    const currentMessageContent = messages[messages.length - 1].content;
    const { stream, handlers } = LangChainStream();
    const cache = new UpstashRedisCache({
      client: Redis.fromEnv(),
    });
    const chatModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      streaming: true,
      callbacks: [handlers],
      verbose: true,
      cache,
    });
    const rephrasingModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      verbose: true,
      cache,
    });
    const rephrasePrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("chat_history"),
      ["user", "{input}"],
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the current question. " +
          "Don't leave out any relevant keywords. Only return the query and no other text.",
      ],
    ]);
    const historyAwareRetrieverChain = await createHistoryAwareRetriever({
      llm: rephrasingModel,
      retriever,
      rephrasePrompt,
    });
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Você está um chat bot para um pessoal portfolio site. Formate suas mensagens em markdown.\n\nContexto:\n{context}",
      ],
      ["user", "{input}"],
    ]);
    // const chain = prompt.pipe(chatModel);
    const combineDocsChain = await createStuffDocumentsChain({
      llm: chatModel,
      prompt,
      documentPrompt: PromptTemplate.fromTemplate(
        "Page URL: {url}\n\nPage content:\n{page_content}",
      ),
      documentSeparator: "\n---------------\n",
    });

    const retrieverChain = await createRetrievalChain({
      combineDocsChain,
      retriever: historyAwareRetrieverChain,
    });
    retrieverChain.invoke({
      input: currentMessageContent,
      chat_history: chatHistory,
    });
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
