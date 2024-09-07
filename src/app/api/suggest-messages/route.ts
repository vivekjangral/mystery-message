import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIStream } from "ai";

export const runtime = "edge";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const response = await model.generateContentStream(prompt);

    // Use the Google Generative AI provider to create a stream
    const stream = GoogleGenerativeAIStream(response);

    // Return a standard Response object with the stream
    return new Response(stream);
  } catch (error) {
    console.error("Unexpected error in sending message", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error in sending message",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
