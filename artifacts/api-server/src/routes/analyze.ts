import { Router, type Request, type Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalyzeClaimBody } from "@workspace/api-zod";

const router = Router();

let genAI: GoogleGenerativeAI | null = null;
const apiKey = process.env.Google_Api_key;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Models confirmed working on this key via v1beta. gemini-3.5-flash works; 2.5/2.0 may be quota-limited.
const MODEL_PRIORITY = [
  "gemini-3.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
];

const ANALYSIS_PROMPT = (text: string, wordCount: number, sentenceCount: number) => `You are Verity, an AI Claim Intelligence Engine. Analyze the following text.

CRITICAL RULE: You are NOT fact-checking. You analyze communication quality, reasoning patterns, confidence calibration, and evidence signals only. Never claim anything is true or false.

Return ONLY valid JSON. No markdown. No code blocks. No explanation. Just raw JSON.

Text to analyze:
"""
${text}
"""

Return exactly this JSON structure:
{
  "scores": {
    "communicationReliability": <integer 0-100>,
    "reasoningQuality": <integer 0-100>,
    "evidenceStrength": <integer 0-100>,
    "confidenceCalibration": <integer 0-100>,
    "sourceQuality": <integer 0-100>,
    "transparency": <integer 0-100>,
    "overallTrustSignal": <integer 0-100>
  },
  "flags": [
    {
      "type": "<specific flag type>",
      "category": "<one of: Reasoning | Evidence | Language | Confidence | Bias | Structure>",
      "severity": "<low|medium|high>",
      "snippet": "<the exact problematic phrase from the text, max 150 chars>",
      "reasoning": "<why this was flagged, 1-2 sentences>",
      "suggestion": "<how to improve, 1-2 sentences>",
      "impact": "<why this matters for trust, 1 sentence>",
      "verificationAdvice": "<what the reader should independently verify, 1 sentence, or null>"
    }
  ],
  "writingStyle": [
    {
      "label": "<style label>",
      "probability": <integer 0-100>,
      "description": "<one sentence characterization>"
    }
  ],
  "summary": "<2-3 sentence overall assessment of communication quality and trustworthiness signals>",
  "riskLevel": "<low|medium|high|critical>",
  "analysisDisclaimer": "This is an analysis of communication quality and reasoning patterns — not a verification of factual truth.",
  "wordCount": ${wordCount},
  "sentenceCount": ${sentenceCount},
  "readabilityScore": <integer 0-100, higher means more readable>
}

SCORING GUIDANCE (be honest and calibrated — avoid extremes unless clearly warranted):
- communicationReliability: Clarity, precision, absence of manipulative language (50-70 is average)
- reasoningQuality: Logical coherence, valid inferences, absence of fallacies
- evidenceStrength: Quality and quantity of evidence — specific data, citations, studies
- confidenceCalibration: Expressed confidence matches actual evidence base (overclaiming = low score)
- sourceQuality: Named sources, experts, organizations, studies explicitly mentioned
- transparency: Acknowledgment of assumptions, limitations, and uncertainty
- overallTrustSignal: Holistic signal — weight reasoning and evidence most heavily

FLAG TYPES to detect (flag only what is genuinely present — be selective, not exhaustive):
Unsupported statistic, Overgeneralization, Absolute claim, Causal leap, Correlation vs causation, Appeal to authority, Appeal to emotion, Cherry-picked example, Confirmation bias, False certainty

WRITING STYLE LABELS (pick 2-4 that best fit, probabilities should sum to ~100):
Human writing, AI-assisted writing, Marketing copy, Academic writing, News reporting, Opinion/editorial, Technical writing, Sales copy, Social media style, Political messaging, Scientific writing
`;

async function tryGenerateContent(prompt: string): Promise<string> {
  if (!genAI) throw new Error("AI service not configured");
  
  for (const modelName of MODEL_PRIORITY) {
    try {
      // v1beta is required — responseMimeType is not available in the v1 stable API
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err: any) {
      const isRetryable =
        err?.status === 429 ||
        err?.status === 404 ||
        err?.message?.includes("429") ||
        err?.message?.includes("Too Many Requests") ||
        err?.message?.includes("RESOURCE_EXHAUSTED") ||
        err?.message?.includes("not found") ||
        err?.message?.includes("404");
      if (isRetryable && modelName !== MODEL_PRIORITY[MODEL_PRIORITY.length - 1]) {
        console.warn(`[Verity] Model ${modelName} unavailable (${err?.status}), trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error("All models exhausted");
}

router.post("/analyze", async (req: Request, res: Response): Promise<void> => {
  if (!genAI) {
    res.status(503).json({ error: "AI service not configured. Google_Api_key environment variable is missing." });
    return;
  }

  const parsed = AnalyzeClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text } = parsed.data;
  const wordCount = text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length;

  try {
    const responseText = await tryGenerateContent(ANALYSIS_PROMPT(text, wordCount, sentenceCount));

    let analysisResult: Record<string, unknown>;
    // Robust JSON extraction: bracket-balancing handles trailing text/multiple objects
    const extractJson = (text: string): string => {
      // Strip markdown code fences first
      const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (fenceMatch) return fenceMatch[1].trim();

      // Find the first { and balance brackets to find the closing }
      const start = text.indexOf('{');
      if (start === -1) throw new Error("No JSON object in response");
      let depth = 0, inString = false, escape = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (escape) { escape = false; continue; }
        if (ch === '\\' && inString) { escape = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth++;
        if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
      }
      throw new Error("Unbalanced JSON in response");
    };

    try {
      analysisResult = JSON.parse(responseText.trim());
    } catch {
      analysisResult = JSON.parse(extractJson(responseText));
    }

    analysisResult.analysedAt = new Date().toISOString();
    analysisResult.wordCount = wordCount;
    analysisResult.sentenceCount = sentenceCount;

    if (!analysisResult.analysisDisclaimer) {
      analysisResult.analysisDisclaimer =
        "This is an analysis of communication quality and reasoning patterns — not a verification of factual truth.";
    }

    res.json(analysisResult);
  } catch (err: any) {
    const is429 = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Too Many Requests") || err?.message?.includes("RESOURCE_EXHAUSTED") || err?.message?.includes("quota");
    
    if (is429) {
      console.warn({ err }, "Gemini API rate limit hit");
      res.status(429).json({
        error: "API quota reached. Your Google AI free-tier limit has been hit. Please wait a minute and try again, or enable billing on your Google AI Studio account for higher limits.",
      });
      return;
    }

    console.error({ err }, "AI analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
