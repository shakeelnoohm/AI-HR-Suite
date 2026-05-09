import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // Set timeout for long requests

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Gemini API key is required. Set GEMINI_API_KEY env var or provide it in settings.' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeText, jobDescription, modelName = 'gemini-1.5-flash' } = body;
    
    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: 'Resume text and Job Description are required.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.0, responseMimeType: "application/json" }
    });

    const prompt = `You are an expert technical recruiter analyzing a candidate's resume against a specific Job Description.

CRITICAL INSTRUCTION: Analyze the candidate's estimated years of experience relative to the JD. You must heavily adjust the score and verdict if the candidate is vastly inexperienced or significantly overexperienced.

Please output exactly ONE valid JSON object in this exact format (and absolutely nothing else):
{
  "score": 85,
  "verdict": true,
  "strengths": ["Match 1", "Match 2"],
  "improvements": ["Missing skill 1", "Missing skill 2"],
  "advice": "Detailed paragraph explaining overall candidate fit and recommendations for the recruiter.",
  "estimatedYears": <Number of years of relevant experience>,
  "experienceMatch": "Inexperienced" | "Appropriate" | "Overexperienced" | "Unknown"
}
("verdict" should be true if they should be shortlisted, false if rejected).

Job Description:
"""
${jobDescription}
"""

Candidate Resume:
"""
${resumeText}
"""
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
    console.error('AI Error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while comparing the resume.' }, 
      { status: 500 }
    );
  }
}
