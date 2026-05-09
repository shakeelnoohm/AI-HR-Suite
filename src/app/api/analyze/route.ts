import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set timeout for long requests (Vercel deployment)

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Gemini API key is required. Please provide it in settings or set GEMINI_API_KEY env var.' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, modelName = 'gemini-1.5-flash' } = body;
    
    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json({ error: 'Resume text is missing or invalid.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
    });

    const prompt = `You are an expert technical recruiter and resume reviewer screening a candidate's resume text extracted from a PDF or pasted by a user.
Please analyze the resume critically and provide detailed, actionable insights for a recruiter. 
Identify the candidate's key strengths, potential red flags or areas for improvement, and assign a mock ATS/Candidate Quality score (1-100).

You must reply with exactly ONE JSON object mathematically and syntactically valid in this format, and absolutely nothing else:
{
  "score": 85,
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Red flag / Concern 1", "Missing skill / Area of concern 2"],
  "feedback": "A comprehensive paragraph giving detailed insights and recommendations for the recruiter reviewing this candidate..."
}

Here is the candidate's resume context:
"""
${resumeText}
"""
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Safely parse JSON from LLM response which may enclose with markdown
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '');
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '');
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.replace(/```$/, '');
    }

    const parsed = JSON.parse(jsonStr.trim());

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while analyzing the resume. Check your API key and try again.' }, 
      { status: 500 }
    );
  }
}
