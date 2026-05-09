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
      generationConfig: { temperature: 0.3 }
    });

    const prompt = `You are a Senior Technical Interviewer and Hiring Manager. Based on the candidate's resume and the Job Description, generate a comprehensive set of interview questions.

Structure the questions into these categories:
1. **Technical Screening Questions** (5-7 questions) — Verify claimed skills and experience depth
2. **Behavioral Questions** (3-5 questions) — Assess culture fit and soft skills
3. **Gap-Probing Questions** (3-5 questions) — Explore missing skills or potential red flags from the resume
4. **Scenario-Based Questions** (2-3 questions) — Test problem-solving relevant to the role

For each question, include a brief note on what the interviewer should look for in the answer.

Return the questions strictly in Markdown format. DO NOT INCLUDE ANY OTHER CONVERSATIONAL TEXT.

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
