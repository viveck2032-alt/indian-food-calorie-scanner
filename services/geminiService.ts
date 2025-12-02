import { GoogleGenAI, Type } from "@google/genai";
import { FoodAnalysisResult } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    dish: {
      type: Type.STRING,
      description: "Name of the Indian dish identified.",
    },
    portion: {
      type: Type.STRING,
      description: "Estimated portion size (e.g., Small bowl, 200g, 1 piece).",
    },
    calories: {
      type: Type.STRING,
      description: "Estimated calories numeric range or value (e.g., 300-350 kcal).",
    },
    confidence: {
      type: Type.INTEGER,
      description: "Confidence score between 0 and 100.",
    },
    is_food: {
      type: Type.BOOLEAN,
      description: "Whether the image contains food.",
    },
    explanation: {
        type: Type.STRING,
        description: "A very brief explanation of the calorie count.",
    }
  },
  required: ["dish", "portion", "calories", "confidence", "is_food"],
};

export const analyzeImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  try {
    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: `You are an expert Indian nutritionist. Analyze this image. 
            Identify the Indian dish, estimate the portion size, and calculate calories based on standard Indian nutrition data.
            If the image is not food, set is_food to false.
            Provide a confidence score (0-100).
            Keep the output simple and direct.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for factual accuracy
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No response from AI");
    }

    const result = JSON.parse(text) as FoodAnalysisResult;
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};
