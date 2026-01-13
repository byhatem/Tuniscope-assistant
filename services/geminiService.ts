
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const chat: Chat = ai.chats.create({
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: `You are a helpful and friendly news assistant for the tuniscope.com website.
- Your knowledge is strictly limited to the information available on www.tuniscope.com.
- Your main goal is to answer user questions based exclusively on the content of tuniscope.com.
- You MUST use the Google Search tool, which is configured to search only within tuniscope.com.
- If a user asks a question that cannot be answered with information from tuniscope.com, you must politely state that you can only answer questions related to the content of that website, in Tunisian Arabic. For example: "سامحني، نجم نجاوبك كان على الأسئلة لي تخص موقع تونيسكوب."
- You MUST ALWAYS speak in the Tunisian Arabic dialect.
- Keep your answers concise, informative, and easy to understand.
- When you use information from a source, it will be provided to the user. Do not mention the sources in your text response.`,
  },
});

export async function getChatResponseStream(
  prompt: string
) {
  const result = await chat.sendMessageStream({
    message: `Using information from tuniscope.com, answer this question: ${prompt}`,
    config: {
      tools: [{ googleSearch: { siteSearch: ["www.tuniscope.com"] } }],
    },
  });
  return result;
}

export async function getInitialSuggestions(): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on the latest news on tuniscope.com, generate exactly 3 short and engaging questions a user might ask. The questions must be in Tunisian Arabic dialect. Format the output as a JSON array of strings. Example: ["Question 1?", "Question 2?", "Question 3?"]`,
      config: {
        tools: [{ googleSearch: { siteSearch: ["www.tuniscope.com"] } }],
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (text) {
      const suggestions = JSON.parse(text);
      if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
        return suggestions;
      }
    }
    return [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    // Return fallback suggestions on error
    return [
      "شنوة آخر الأخبار في تونس؟",
      "لخصلي أهم أخبار الرياضة اليوم.",
      "فماش أخبار جديدة على الإقتصاد؟"
    ];
  }
}
