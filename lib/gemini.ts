import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ImageGenerativePart {
    inlineData: {
        data: string
        mimeType: string
    },
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function ocr(image: ImageGenerativePart) {
    const result = await model.generateContent(["Only write everything in the image out in  human-readable format, following the format as in the image, WITHOUT ANYTHING ELSE. DO NOT PERFORM OCR AND DO NOT WRITE LATEX. Use new lines when needed. Preserve mathematical symbols. Use ^ for power (if any).", image]);

    const text = result.response.text();

    return text;
}

export async function solve(problem: string) {
    const result = await model.generateContent(["Solve this math problem:", problem]);

    const text = result.response.text();

    return text;
}