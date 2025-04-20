'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function chat(prompt: string) {
  const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
  const model = genAi.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  return result.response.text()
}
