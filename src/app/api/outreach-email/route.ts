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

    const prompt = `You are a Senior Recruiter crafting a professional outreach email to a promising candidate. Write two versions:

**Version 1: Interview Invitation Email**
Write a warm, professional email inviting the candidate for an interview. Reference specific skills from their resume that caught your eye. Include:
- Subject line
- Personalized greeting
- Why you're reaching out (reference specific resume highlights)
- Role overview and why they'd be a great fit
- Next steps and call-to-action
- Professional sign-off with [Recruiter Name] and [Company Name] placeholders

**Version 2: Rejection Email (Polite)**
Write a respectful, professional rejection email that:
- Thanks the candidate for their application
- Is encouraging without being misleading
- Leaves the door open for future opportunities
- Includes [Company Name] placeholder

Return both emails strictly in Markdown format, clearly separated. DO NOT INCLUDE ANY OTHER CONVERSATIONAL TEXT.

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
