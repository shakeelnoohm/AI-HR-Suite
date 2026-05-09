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
      generationConfig: { temperature: 0.5 }
    });

    const prompt = `You are an expert career coach. Write a highly engaging, personalized Cover Letter for the candidate applying to the given Job Description.
Bridge the candidate's specific background directly to the exact requirements of the JD. 
Let it be 3 paragraphs: Introduction/Enthusiasm, Core Strengths (referencing specific resume points), and a strong Closing.
Include [Placeholder] bracketed text for areas they need to fill in (like Company Name or Hiring Manager).
Return the cover letter strictly in Markdown format. DO NOT INCLUDE ANY OTHER CONVERSATIONAL TEXT.

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
