"use client";

import { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, FileText, CheckCircle, Sparkles, Settings, 
  ChevronRight, Loader2, AlertCircle, Briefcase, Users, LayoutDashboard 
} from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const extractTextFromPdf = async (file: File) => {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  } catch (err) {
    console.error("PDF parsing error", err);
    throw new Error("Could not parse PDF. Please try pasting the text instead.");
  }
};

export const extractTextFromDoc = async (file: File) => {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (err) {
    console.error("DOC parsing error", err);
    throw new Error("Could not parse DOC/DOCX. Please try pasting the text instead.");
  }
};

const ACCEPTED_EXTENSIONS = /\.(pdf|doc|docx|txt|md)$/i;
const ACCEPTED_FORMATS = ".pdf,.doc,.docx,.txt,.md";

export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!ACCEPTED_EXTENSIONS.test(file.name)) {
    throw new Error("Unsupported file format. Please upload PDF, DOC, DOCX, or TXT files.");
  }
  if (file.type === "application/pdf") {
    return extractTextFromPdf(file);
  }
  if (
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.match(/\.(doc|docx)$/i)
  ) {
    return extractTextFromDoc(file);
  }
  return file.text();
};

export default function Home() {
  const [apiKey, setApiKey] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
  const [modelName, setModelName] = useState("gemini-2.5-flash");
  const [activeTab, setActiveTab] = useState<"general" | "jd-match" | "hr-bulk" | "settings">("general");

  useEffect(() => {
    const savedKey = localStorage.getItem("resume_ai_api_key");
    const savedModel = localStorage.getItem("resume_ai_model_name");
    if (savedKey) setApiKey(savedKey);
    if (savedModel) setModelName(savedModel);
  }, []);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
    localStorage.setItem("resume_ai_api_key", e.target.value);
  };
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModelName(e.target.value);
    localStorage.setItem("resume_ai_model_name", e.target.value);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      
      {/* Hero Section */}
      <section className="animate-fade-in" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', marginBottom: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.875rem', fontWeight: 500 }}>
          <Sparkles size={16} />
        </div>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          Discover the Ultimate <br />
          <span className="text-gradient">AI HR Suite</span>
        </h2>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Streamline your hiring process. Screen candidates, analyze job fit, and rank applicants instantly.
        </p>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
        <TabButton icon={<LayoutDashboard size={18}/>} label="Quick Scan" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
        <TabButton icon={<Briefcase size={18}/>} label="JD Match" active={activeTab === 'jd-match'} onClick={() => setActiveTab('jd-match')} />
        <TabButton icon={<Users size={18}/>} label="Bulk Screener" active={activeTab === 'hr-bulk'} onClick={() => setActiveTab('hr-bulk')} />
        <TabButton icon={<Settings size={18}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        
        {activeTab === 'settings' && (
          <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              <Settings size={20} className="pulse-glow" style={{ color: 'var(--accent-secondary)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Settings</h3>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Google Gemini API Key</label>
                <input type="password" placeholder="...AIzaSy..." className="input-base" value={apiKey} onChange={handleKeyChange} />
              </div>
              <div style={{ flex: '1 1 300px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AI Model</label>
                <input type="text" className="input-base" value={modelName} onChange={handleModelChange} />
              </div>
            </div>
          </section>
        )}

        {activeTab === 'general' && <GeneralReview apiKey={apiKey} modelName={modelName} />}
        {activeTab === 'jd-match' && <JDMatch apiKey={apiKey} modelName={modelName} />}
        {activeTab === 'hr-bulk' && <HRBulk apiKey={apiKey} modelName={modelName} />}
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '30px',
        background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}`,
        fontWeight: active ? 600 : 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s ease'
      }}
    >
      {icon} {label}
    </button>
  );
}

function downloadResult(format: string, data: any, baseName: string) {
  const filename = `${baseName}.${format === 'excel' ? 'xlsx' : format}`;
  
  if (format === 'pdf') {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text(baseName.replace(/_/g, ' ').toUpperCase(), 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);
    
    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      const body = data.map((row: any) => headers.map(h => row[h]));
      autoTable(doc, {
        startY: 40,
        head: [headers.map(h => h.toUpperCase())],
        body: body,
        theme: 'striped',
        headStyles: { fillStyle: '#3b82f6' }
      });
    } else {
      // For objects (GeneralReview, JDMatch)
      const rows = [];
      if (data.score) rows.push(['SCORE', `${data.score}/100`]);
      if (data.verdict !== undefined) rows.push(['VERDICT', data.verdict ? 'SHORTLIST' : 'REJECT']);
      if (data.strengths) rows.push(['STRENGTHS', data.strengths.join('\n• ')]);
      if (data.improvements) rows.push(['IMPROVEMENTS / MISSING', data.improvements.join('\n• ')]);
      if (data.feedback) rows.push(['FEEDBACK', data.feedback]);
      if (data.advice) rows.push(['ADVICE', data.advice]);

      autoTable(doc, {
        startY: 40,
        head: [['SECTION', 'DETAILS']],
        body: rows,
        theme: 'grid',
        headStyles: { fillStyle: '#3b82f6' },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
      });
    }
    doc.save(filename);
    return;
  }

  if (format === 'excel') {
    const worksheet = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
    XLSX.writeFile(workbook, filename);
    return;
  }

  // Fallback for TXT, DOC, CSV
  let mime = '';
  let content = '';
  switch (format) {
    case 'doc':
    case 'txt':
      mime = format === 'doc' ? 'application/msword' : 'text/plain';
      if (typeof data === 'string') {
        content = data;
      } else if (Array.isArray(data)) {
        content = data.map((item: any) => Object.entries(item).map(([k,v]) => `${k}: ${v}`).join('\n')).join('\n\n---\n\n');
      } else {
        content = Object.entries(data).map(([k, v]) => `${k.toUpperCase()}:\n${Array.isArray(v) ? v.join('\n- ') : v}`).join('\n\n');
      }
      break;
    case 'csv':
      mime = 'text/csv';
      if (Array.isArray(data)) {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((row: any) => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
        content = headers.join(',') + '\n' + rows.join('\n');
      } else {
        const entries = Object.entries(data);
        content = entries.map(([k, v]) => `"${k}","${(v ?? '').toString().replace(/"/g, '""')}"`).join('\n');
      }
      break;
    default:
      mime = 'application/octet-stream';
      content = JSON.stringify(data, null, 2);
  }
  
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------------------------------------
// Component: GeneralReview
// -------------------------------------------------------------------------------------
function GeneralReview({ apiKey, modelName }: { apiKey: string, modelName: string }) {
  const [textMode, setTextMode] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const text = await extractTextFromFile(file);
      setResumeText(text);
      setFileName(file.name);
      localStorage.setItem('generalResult', JSON.stringify({ resumeText: text, fileName: file.name }));
    } catch (err: any) {
      setFileName("");
      setError(err.message);
    }
  };

  const handleAnalyze = async () => {
    if (!apiKey) return setError("Please provide an API key in settings.");
    if (!resumeText) return setError("Please provide your resume.");
    setError(""); setIsAnalyzing(true); setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ resumeText, modelName })
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to analyze");
      const data = await res.json();
      setResult(data);
      localStorage.setItem('generalResult', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('generalResult');
    if (saved) setResult(JSON.parse(saved));
  }, []);

  return (
    <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} style={{ color: 'var(--accent-primary)' }}/> Candidate Resume</h3>
        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }} onClick={() => setTextMode(!textMode)}>
          {textMode ? "Switch to File Upload" : "Switch to Text"}
        </button>
      </div>

      {!textMode ? (
        <Dropzone text="Upload resume (PDF, DOC, DOCX, TXT)" fileName={fileName} fileRef={fileInputRef} onChange={handleFileUpload} />
      ) : (
        <textarea className="input-base" rows={8} placeholder="Paste candidate resume here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
      )}

      {error && <ErrorBox msg={error} />}

      <SubmitButton onClick={handleAnalyze} isLoading={isAnalyzing} disabled={!apiKey || !resumeText} text="Quick Scan Resume" />

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Candidate Quality: <span className="text-gradient-accent">{result.score}/100</span></h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <ResultList title="Candidate Strengths" items={result.strengths} color="var(--success)" />
            <ResultList title="Concerns / Red Flags" items={result.improvements} color="var(--warning)" />
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            <strong>Recruiter Notes:</strong> <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{result.feedback}</p>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {["pdf", "doc", "txt", "csv", "excel"].map(fmt => (
              <button
                key={fmt}
                className="btn-secondary"
                style={{ padding: '6px 12px' }}
                onClick={() => downloadResult(fmt, result, 'general_review_result')}
              >
                Download {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------------------------------
// Component: JDMatch
// -------------------------------------------------------------------------------------
function JDMatch({ apiKey, modelName }: { apiKey: string, modelName: string }) {
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jdFileName, setJdFileName] = useState("");
  const [jdMode, setJdMode] = useState<"text" | "file">("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setResumeText(await extractTextFromFile(file));
      setFileName(file.name);
    } catch (err: any) { setFileName(""); setError(err.message); }
  };

  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setJobDescription(await extractTextFromFile(file));
      setJdFileName(file.name);
    } catch (err: any) { setJdFileName(""); setError(err.message); }
  };

  const handleAnalyze = async () => {
    if (!apiKey) return setError("Please provide an API key in settings.");
    if (!resumeText || !jobDescription) return setError("Please provide both resume and job description.");
    setError(""); setIsAnalyzing(true); setResult(null); setGeneratedContent("");

    try {
      const res = await fetch("/api/compare", {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ resumeText, jobDescription, modelName })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setResult(data);
      localStorage.setItem('jdMatchResult', JSON.stringify(data));
    } catch (err: any) { setError(err.message); } finally { setIsAnalyzing(false); }
  };

  useEffect(() => {
    const saved = localStorage.getItem('jdMatchResult');
    if (saved) setResult(JSON.parse(saved));
  }, []);

  const handleAction = async (actionPath: string) => {
    if (!apiKey) return setError("Please provide an API key in settings.");
    setLoadingAction(actionPath);
    setGeneratedContent("");
    setError("");
    try {
      const res = await fetch(`/api/${actionPath}`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey },
        body: JSON.stringify({ resumeText, jobDescription, modelName })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const data = await res.json();
      setGeneratedContent(data.markdown);
    } catch (err: any) { setError(err.message); } finally { setLoadingAction(""); }
  };

  return (
    <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={20} className="text-gradient-accent"/> Candidate Fit Assessment</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Candidate Resume (PDF, DOC, TXT)</label>
          <Dropzone text="Upload Candidate Resume" fileName={fileName} fileRef={fileInputRef} onChange={handleFileUpload} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Job Description / Role Requirements</label>
            <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => { setJdMode(jdMode === 'text' ? 'file' : 'text'); }}>
              {jdMode === 'text' ? 'Upload File' : 'Type / Paste'}
            </button>
          </div>
          {jdMode === 'text' ? (
            <textarea className="input-base" rows={6} placeholder="Paste or type your JD here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
          ) : (
            <Dropzone text="Upload JD (PDF, DOC, DOCX, TXT)" fileName={jdFileName} fileRef={jdFileInputRef} onChange={handleJdFileUpload} />
          )}
        </div>
      </div>
      {error && <ErrorBox msg={error} />}
      <SubmitButton onClick={handleAnalyze} isLoading={isAnalyzing} disabled={!apiKey || !resumeText || !jobDescription} text="Assess Candidate Fit" />

      {result && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Match Score: <span className="text-gradient-accent">{result.score}/100</span></h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {result.experienceMatch && (
                <div style={{ padding: '8px 16px', borderRadius: '30px', fontWeight: 700, fontSize: '0.875rem',
                  background: result.experienceMatch === 'Appropriate' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: result.experienceMatch === 'Appropriate' ? 'var(--success)' : 'var(--warning)',
                  border: `1px solid ${result.experienceMatch === 'Appropriate' ? 'var(--success)' : 'var(--warning)'}`
                }}>
                  {result.experienceMatch.toUpperCase()} ({result.estimatedYears} YRS)
                </div>
              )}
              <div style={{ padding: '8px 16px', borderRadius: '30px', fontWeight: 700, fontSize: '0.875rem',
                background: result.verdict ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: result.verdict ? 'var(--success)' : 'var(--error)',
                border: `1px solid ${result.verdict ? 'var(--success)' : 'var(--error)'}`
              }}>
                {result.verdict ? "VERDICT: SHORTLIST" : "VERDICT: REJECT"}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <ResultList title="Key Strengths" items={result.strengths} color="var(--success)" />
            <ResultList title="Missing Requirements" items={result.improvements} color="var(--error)" />
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px' }}>
            <strong>Recruiter Advice:</strong> <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{result.advice}</p>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {["pdf", "doc", "txt", "csv", "excel"].map(fmt => (
              <button
                key={fmt}
                className="btn-secondary"
                style={{ padding: '6px 12px' }}
                onClick={() => downloadResult(fmt, result, 'jd_match_result')}
              >
                Download {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => handleAction('interview-questions')} disabled={loadingAction !== ""}>
              {loadingAction === 'interview-questions' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : "🎤 Interview Questions"}
            </button>
            <button className="btn-secondary" onClick={() => handleAction('candidate-summary')} disabled={loadingAction !== ""}>
              {loadingAction === 'candidate-summary' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : "📋 Candidate Summary"}
            </button>
            <button className="btn-secondary" onClick={() => handleAction('outreach-email')} disabled={loadingAction !== ""}>
              {loadingAction === 'outreach-email' ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : "✉️ Gen Outreach Email"}
            </button>
          </div>

          {generatedContent && (
            <div className="glass-panel animate-fade-in" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.875rem' }} onClick={() => navigator.clipboard.writeText(generatedContent)}>
                  Copy to Clipboard
                </button>
              </div>
              <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 1.6, overflowX: 'auto' }}>
                {generatedContent}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------------------------------
// Component: HRBulk
// -------------------------------------------------------------------------------------
function HRBulk({ apiKey, modelName }: { apiKey: string, modelName: string }) {
  const [resumes, setResumes] = useState<{filename: string, text: string, url?: string}[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [jdFileName, setJdFileName] = useState("");
  const [jdMode, setJdMode] = useState<"text" | "file">("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jdFileInputRef = useRef<HTMLInputElement>(null);

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    
    const parsedPromises = files.map(async (file) => {
      const url = URL.createObjectURL(file);
      try {
        return { filename: file.name, text: await extractTextFromFile(file), url };
      } catch {
        return null;
      }
    });

    const parsedResults = await Promise.all(parsedPromises);
    const parsed = parsedResults.filter(Boolean) as {filename: string, text: string, url: string}[];
    
    if (parsed.length === 0) setError("No valid files were parsed. Supported: PDF, DOC, DOCX, TXT.");
    else setResumes(prev => [...prev, ...parsed]);
  };

  const handleJdFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setJobDescription(await extractTextFromFile(file));
      setJdFileName(file.name);
    } catch (err: any) { setJdFileName(""); setError(err.message); }
  };

  const handleRank = async () => {
    if (!apiKey) return setError("Please provide an API key.");
    if (resumes.length === 0 || !jobDescription) return setError("Please provide resumes and job description.");
    setError(""); setIsAnalyzing(true); setResult(null); setProgress(0);

    try {
      const batchSize = 10;
      const batches = [];
      for (let i = 0; i < resumes.length; i += batchSize) {
        batches.push(resumes.slice(i, i + batchSize));
      }

      let completed = 0;
      let allResults: any[] = [];

      const promises = batches.map(async (batch) => {
        const res = await fetch("/api/rank", {
          method: "POST", headers: { "Content-Type": "application/json", "x-api-key": apiKey },
          body: JSON.stringify({ resumes: batch, jobDescription, modelName })
        });
        if (!res.ok) throw new Error((await res.json()).error || "Batch failed.");
        const data = await res.json();
        
        completed += 1;
        setProgress(Math.round((completed / batches.length) * 100));
        
        return data.ranked || [];
      });

      const resultsArrays = await Promise.all(promises);
      resultsArrays.forEach(arr => allResults.push(...arr));
      
      allResults.sort((a, b) => b.score - a.score);
      setResult({ ranked: allResults });
      localStorage.setItem('hrBulkResult', JSON.stringify({ ranked: allResults }));
    } catch (err: any) { 
      setError(err.message || "Failed validating a massive batch properly. Please try fewer files per run."); 
    } finally { 
      setIsAnalyzing(false); 
      setProgress(0);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('hrBulkResult');
    if (saved) setResult(JSON.parse(saved));
  }, []);

  return (
    <section className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} className="text-gradient-accent"/> HR Bulk Screening Validator</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label style={{ fontWeight: 500, fontSize: '0.9rem' }}>Job Description / Requirements</label>
          <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => { setJdMode(jdMode === 'text' ? 'file' : 'text'); }}>
            {jdMode === 'text' ? 'Upload File' : 'Type / Paste'}
          </button>
        </div>
        {jdMode === 'text' ? (
          <textarea className="input-base" rows={4} placeholder="Paste or type role requirements here..." value={jobDescription} onChange={e => setJobDescription(e.target.value)} />
        ) : (
          <Dropzone text="Upload JD (PDF, DOC, DOCX, TXT)" fileName={jdFileName} fileRef={jdFileInputRef} onChange={handleJdFileUpload} />
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem' }}>Upload Candidates Resumes (Batch)</label>
        <Dropzone text="Upload resumes (PDF, DOC, DOCX, TXT)" fileName={`${resumes.length} resumes loaded.`} fileRef={fileInputRef} onChange={handleBulkUpload} multiple />
        {resumes.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resumes.map((r, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>{r.filename}</span>
            ))}
            <button onClick={() => setResumes([])} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)', border: 'none', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', cursor: 'pointer' }}>Clear</button>
          </div>
        )}
      </div>

      {error && <ErrorBox msg={error} />}
      
      <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
        <button className="btn-primary" onClick={handleRank} disabled={!apiKey || resumes.length === 0 || !jobDescription || isAnalyzing} style={{ width: '100%', padding: '16px', position: 'relative', overflow: 'hidden' }}>
          {isAnalyzing && (
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${progress}%`, background: 'rgba(255,255,255,0.2)', transition: 'width 0.3s ease' }}/>
          )}
          {isAnalyzing ? <><Loader2 className="pulse-glow" size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing {progress}% ...</> : <>Rank {resumes.length || ''} Candidates <ChevronRight size={18} /></>}
        </button>
      </div>

      {result && result.ranked && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Ranking Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {result.ranked.map((item: any, i: number) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px', background: i === 0 ? 'var(--success)' : (i === 1 ? 'var(--accent-primary)' : 'var(--text-secondary)') }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      #{i + 1} {item.candidateName}
                      {item.experienceMatch && (
                        <span style={{ 
                          fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 600,
                          background: item.experienceMatch === 'Appropriate' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', 
                          color: item.experienceMatch === 'Appropriate' ? 'var(--success)' : 'var(--warning)',
                          border: `1px solid ${item.experienceMatch === 'Appropriate' ? 'var(--success)' : 'var(--warning)'}`
                        }}>
                          {item.experienceMatch} ({item.estimatedYears} Yrs)
                        </span>
                      )}
                    </h4>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.filename}</p>
                      {(() => {
                        const r = resumes.find(r => r.filename === item.filename);
                        return r?.url ? (
                          <a href={r.url} download={r.filename} style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                            [Download]
                          </a>
                        ) : null;
                      })()}
                    </div>

                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{item.briefReasoning}</p>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: i === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {item.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {["pdf", "doc", "txt", "csv", "excel"].map(fmt => (
              <button
                key={fmt}
                className="btn-secondary"
                style={{ padding: '6px 12px' }}
                onClick={() => downloadResult(fmt, result.ranked, 'hr_bulk_ranking_results')}
              >
                Download {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// -------------------------------------------------------------------------------------
// UI Utilities
// -------------------------------------------------------------------------------------
function Dropzone({ text, fileName, fileRef, onChange, multiple = false }: any) {
  return (
    <div 
      style={{ border: '2px dashed var(--card-border)', borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', transition: 'border 0.3s ease' }}
      onClick={() => fileRef.current?.click()}
    >
      <input type="file" ref={fileRef} hidden accept={ACCEPTED_FORMATS} multiple={multiple} onChange={onChange} />
      {fileName && fileName !== "0 resumes loaded." ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={32} style={{ color: 'var(--success)' }} />
          <p style={{ fontWeight: 600 }}>{fileName}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={32} style={{ color: 'var(--text-secondary)' }} />
          <p style={{ fontWeight: 600 }}>{text}</p>
        </div>
      )}
    </div>
  );
}

function SubmitButton({ onClick, isLoading, disabled, text }: any) {
  return (
    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
      <button className="btn-primary" onClick={onClick} disabled={disabled || isLoading} style={{ width: '100%', padding: '16px' }}>
        {isLoading ? <><Loader2 className="pulse-glow" size={20} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : <>{text} <ChevronRight size={18} /></>}
      </button>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{ marginTop: '1rem', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
      <AlertCircle size={18} /> {msg}
    </div>
  );
}

function ResultList({ title, items, color }: any) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--card-border)', padding: '1.5rem', borderRadius: '12px' }}>
      <h4 style={{ color, marginBottom: '1rem', fontWeight: 600 }}>{title}</h4>
      <ul style={{ listStylePosition: 'inside', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
        {items?.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}
