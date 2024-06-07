import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv"

dotenv.config();

export interface ImageGenerativePart {
    inlineData: {
        data: string
        mimeType: string
    },
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function ocr(image: ImageGenerativePart) {
    const result = await model.generateContent(["Only write everything in the image out in human-readable format, following the format as in the image, WITHOUT ANYTHING ELSE. DO NOT PERFORM OCR AND DO NOT WRITE LATEX. Use new lines when needed. Preserve mathematical symbols. Use ^ for power (if any). Remember to use brackets when needed, like in a fraction.", image]);

    const text = result.response.text();

    return text;
}

export async function solve(problem: string) {
    const result = await model.generateContent(["Solve this math problem. Use katex for all math expressions (enclosed with double dollar signs, $$, NEVER USE single $). Each = sth must be on a separate line. You should never say you are using latex/katex. Try to be more verbose and explain how to solve it.", problem]);

    const text = result.response.text();

    return text;
}

export async function solveStream(problem: string) {
    const result = await model.generateContentStream(["Solve this math problem. Use katex for all math expressions (enclosed with double dollar signs, $$, NEVER USE single $). Each = sth must be on a separate line. You should never say you are using latex/katex. Try to be more verbose and explain how to solve it.", problem]);

    return result.stream;
}