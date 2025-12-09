import { GoogleGenAI } from "@google/genai";
import { UserProfile, FoodAnalysisResult } from "../types";
import { analyzeFoodText } from "./nutritionService";

// Safe initialization
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const chatWithAssistant = async (
  message: string, 
  userProfile: UserProfile | null, 
  history: {role: string, text: string}[] = [],
  sessionContext: string = ""
): Promise<string> => {
  const ai = getAIClient();
  if (!ai) {
    return "I'm sorry, I cannot connect to the Specialist service right now (Missing API Key).";
  }

  const userContext = userProfile 
    ? `User Profile: Age ${userProfile.age}, Mode: ${userProfile.mode}, Pain Areas: ${userProfile.painAreas.join(', ')}. Goals: ${userProfile.goals.join(', ')}.`
    : "User Context: Guest User.";

  const currentActivityContext = sessionContext ? `CURRENT STATUS: ${sessionContext}` : "CURRENT STATUS: Idle/Browsing.";

  const systemInstruction = `You are "Dr. Flex", a senior physiotherapist and fitness specialist for the "DigiPhysio Coach" app.
  
  ${userContext}
  ${currentActivityContext}
  
  Your Persona:
  - Professional but warm and encouraging.
  - Use medical terminology correctly but explain it simply.
  - If the user is currently doing an exercise (see CURRENT STATUS), give specific, real-time cues for that movement.
  - If the user just finished, congratulate them and suggest recovery (water, stretching).
  
  Rules:
  1. Keep answers concise (max 3 sentences) unless asked for a list.
  2. NEVER give a definitive medical diagnosis (e.g., "You have a torn meniscus"). Instead, say "This sounds like it could be X, but please see a doctor."
  3. No extreme diets. Focus on balanced nutrition.
  4. Always reference their specific context (e.g., "Since you have knee pain...") when relevant.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I didn't quite catch that. Could you rephrase?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the specialist server. Please try again in a moment.";
  }
};

export const analyzeFoodPhoto = async (imageBase64: string): Promise<FoodAnalysisResult> => {
  const ai = getAIClient();
  const fallback: FoodAnalysisResult = {
    name: "Unknown Food",
    tags: ["Food"],
    calories: "Unknown",
    protein: "-",
    fat: "-",
    carbs: "-",
    fiber: "-",
    ingredients: [],
    healthTips: "Could not analyze. Please try again.",
    balanced: false,
    summary: "Analysis failed."
  };

  if (!ai) return { ...fallback, summary: "AI Service Unavailable" };

  // Strip prefix if present
  const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

  try {
    // Step 1: Ask Gemini to describe the food in a way that API Ninjas can understand
    const prompt =
      'You are a nutrition assistant. Look at this meal photo and respond ONLY with a short ingredient line ' +
      'that a nutrition API can understand, such as: "1 cup cooked rice, 120g grilled chicken breast". ' +
      'Be specific with quantities and cooking methods. Only respond with the ingredient line, nothing else.';

    const gemRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      }
    });

    const foodDescription = gemRes.text?.trim() || "";

    if (!foodDescription) {
      return fallback;
    }

    // Step 2: Call our backend nutrition API with the Gemini description
    const nutrition = await analyzeFoodText(foodDescription);

    // Step 3: Add a tag to indicate this came from photo detection
    return {
      ...nutrition,
      tags: [...(nutrition.tags || []), 'photo-ai'],
    };
  } catch (error) {
    console.error("Food photo analysis error:", error);
    return fallback;
  }
};

export const specialistSummary = async (area: string, answers: any): Promise<string> => {
     const ai = getAIClient();
     if (!ai) return "Assessment complete. Please consult a doctor for a diagnosis.";

     const prompt = `
     User performed a self-check for: ${area}.
     Questionnaire answers: ${JSON.stringify(answers)}.
     
     Provide a SAFE, non-medical summary. Mention if their habits (sitting, sleep) might be contributors.
     Suggest 2 gentle habits.
     Recommend up to two OTC medications (by generic name) that typically help with the symptoms, but include a caution to confirm with their doctor or pharmacist.
     Disclaimer: Start with "This is not a medical diagnosis."
     `;

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Could not generate summary.";
     } catch (e) {
         return "Assessment recorded.";
     }
}

export const getSpecialistQuestions = async (area: string): Promise<string[]> => {
    const fallback = [
        `On a scale of 0 to 10, how intense is your ${area} discomfort at its worst?`,
        `What specific movement or time of day makes your ${area} symptoms flare up?`,
        `Do you ever feel numbness, tingling, or weakness spreading away from your ${area}?`,
        `What self-care steps or medications have you already tried for this ${area} issue?`
    ];

    const ai = getAIClient();
    if (!ai) return fallback;

    const prompt = `
      Provide ${fallback.length} succinct musculoskeletal triage questions for assessing ${area} discomfort.
      Each question should sound like it is being asked by a physiotherapist.
      Return a JSON array of plain strings. No numbering, no extra text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        const raw = response.text?.trim() || "";
        const clean = raw
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length) {
            return parsed.map((q) => (typeof q === "string" ? q : "")).filter(Boolean);
        }
    } catch (error) {
        console.error("Gemini question generation error:", error);
    }
    return fallback;
};
