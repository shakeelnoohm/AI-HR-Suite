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

    const prompt = `You are a Senior Recruiter preparing a candidate briefing for the Hiring Manager. Create a concise, professional Candidate Summary Report.

Structure the report as follows:
1. **Candidate Snapshot** — Name, estimated experience level, current/last role, key technical stack
2. **Fit Assessment** — How well the candidate matches the Job Description (High / Medium / Low fit), with a 2-3 sentence justification
3. **Key Qualifications** — Bullet list of the candidate's most relevant qualifications for this role
4. **Potential Concerns** — Bullet list of gaps, red flags, or areas needing further exploration
5. **Compensation Estimate** — Based on their experience level and skill set, suggest a salary range bracket (Junior/Mid/Senior/Lead level)
6. **Recommendation** — One clear paragraph: Should we proceed to interview? Why or why not?

Return the report strictly in Markdown format. DO NOT INCLUDE ANY OTHER CONVERSATIONAL TEXT.

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
