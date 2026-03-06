import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

async function main() {
  try {
    const res = await genAI.listModels()
    console.log(JSON.stringify(res, null, 2))
  } catch (err) {
    console.error('Error listing models:', err)
    process.exit(1)
  }
}

main()
