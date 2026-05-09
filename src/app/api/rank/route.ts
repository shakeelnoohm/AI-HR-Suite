import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120; // Longer timeout for bulk operations

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Gemini API key is required. Set GEMINI_API_KEY env var or provide it in settings.' }, { status: 401 });
    }

    const body = await req.json();
    const { resumes, jobDescription, modelName = 'gemini-1.5-flash' } = body;
    
    if (!resumes || !Array.isArray(resumes) || resumes.length === 0 || !jobDescription) {
      return NextResponse.json({ error: 'List of resumes and Job Description are required.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
    });

    const prompt = `You are an expert HR screening assistant. You are provided with a Job Description and a batch of multiple resumes.
Your task is to rank the resumes based on how well they fit the Job Description securely and fairly.

CRITICAL INSTRUCTION: Analyze each candidate's estimated years of experience relative to the JD. You must heavily dock points if the candidate is vastly inexperienced or significantly overexperienced for the requested role.

Please output exactly ONE valid JSON object in this exact format (and absolutely nothing else):
{
  "ranked": [
    {
      "filename": "original filename exactly as provided",
      "candidateName": "Extracted full name, or 'Unknown'",
      "score": 92,
      "briefReasoning": "One sentence explaining why they received this score based on the JD.",
      "estimatedYears": <Number of years of experience>,
      "experienceMatch": "Inexperienced" | "Appropriate" | "Overexperienced" | "Unknown"
    }
  ]
}
Make sure the array is sorted by score in descending order (highest score first).

Job Description:
"""
${jobDescription}
"""

Resumes:
${resumes.map(r => `--- START RESUME (Filename: ${r.filename}) ---\n${r.text}\n--- END RESUME ---\n`).join("\n")}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');

    const parsed = JSON.parse(jsonStr.trim());

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI Bulk Rank Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while ranking the resumes.' }, 
      { status: 500 }
    );
  }
}
