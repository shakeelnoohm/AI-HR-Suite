import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key is required. Set GEMINI_API_KEY env var or provide it in settings.' }, { status: 401 });

    const body = await req.json();
    const { resumeText, jobDescription, modelName = 'gemini-1.5-flash' } = body;
    
    if (!resumeText || !jobDescription) return NextResponse.json({ error: 'Missing requirements.' }, { status: 400 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { temperature: 0.1 }
    });

    const prompt = `You are an expert resume writer and technical recruiter. 
Rewrite the following resume to perfectly match the provided Job Description. 
Optimize bullet points, highlight relevant skills, and remove irrelevant information to maximize ATS match percentage.
Do NOT lie or invent facts; rewrite the existing facts to be more impactful.
Return the customized resume strictly in Markdown format. DO NOT INCLUDE ANY OTHER CONVERSATIONAL TEXT.

Job Description:
"""
${jobDescription}
"""

Resume:
"""
${resumeText}
"""
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('\`\`\`markdown')) text = text.replace(/^\`\`\`markdown/, '');
    if (text.startsWith('\`\`\`')) text = text.replace(/^\`\`\`/, '');
    if (text.endsWith('\`\`\`')) text = text.replace(/\`\`\`$/, '');

    return NextResponse.json({ markdown: text.trim() });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
