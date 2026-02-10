import { GoogleGenAI } from "@google/genai";

/**
 * Generates technical architectural explanations using the Gemini API.
 * Optimized for Midnight Network and Compact (Minokawa) context.
 */
export const generateArchitectureExplanation = async (query: string): Promise<string> => {
  try {
    // Initializing the AI client with the system-provided API Key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const systemInstruction = `
      You are a World-Class Senior Blockchain Architect specialized in the Midnight Network and Compact (Minokawa).
      You are explaining the "Universal Privacy Passport" architecture.
      
      Core Technical Context:
      - Midnight: A privacy-preserving sidechain using ZK-SNARKs.
      - Compact: The DSL for Midnight contracts.
      - Architecture: Local Witness (Private) vs. On-chain Ledger (Public).
      - Tokenomics: NIGHT (Utility/Staking) and DUST (Resource/Gas).
      
      Your goal is to provide concise, professional, and deep technical insights.
      Use Markdown for lists and code snippets.
      Keep responses under 200 words.
    `;

    // Using gemini-3-flash-preview for better latency and reduced "Internal Error" risks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Directly access the .text property from the GenerateContentResponse.
    return response.text || "I am currently unable to analyze this architectural query.";
  } catch (error) {
    console.error("Architect AI Error:", error);
    return "The architectural oracle encountered a transient connection issue. Please verify your network and try again.";
  }
};