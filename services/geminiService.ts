import { GoogleGenAI, Type } from "@google/genai";
import { aiPlanSchema, Task, Priority, Status } from "../types";
import { v4 as uuidv4 } from 'uuid'; // We'll simulate uuid if not available, but let's assume simple ID gen in components

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelId = "gemini-2.5-flash";

/**
 * Generates a project plan (list of tasks) based on a high-level goal.
 */
export const generateProjectPlan = async (goal: string): Promise<Partial<Task>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a detailed breakdown of tasks to achieve this goal: "${goal}". 
      Break it down into 3-6 actionable tasks. 
      Keep descriptions concise but clear. 
      Suggest reasonable tags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: aiPlanSchema,
        systemInstruction: "You are an expert Agile Project Manager. You break down vague requirements into actionable, technical, and business tasks."
      }
    });

    if (response.text) {
      const rawTasks = JSON.parse(response.text);
      // Map to our Task type (adding defaults for missing fields)
      return rawTasks.map((t: any) => ({
        ...t,
        status: Status.TODO,
        createdAt: Date.now()
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw error;
  }
};

/**
 * Enhances a task description to be more professional and detailed.
 */
export const enhanceTaskDescription = async (title: string, currentDescription: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Title: ${title}\nDraft Description: ${currentDescription}`,
      config: {
        responseMimeType: "text/plain",
        systemInstruction: "You are a Technical Writer. Rewrite the following task description to be professional, clear, and formatted with Markdown (bullet points where applicable). Keep it under 150 words."
      }
    });

    return response.text || currentDescription;
  } catch (error) {
    console.error("Failed to enhance description:", error);
    return currentDescription;
  }
};
