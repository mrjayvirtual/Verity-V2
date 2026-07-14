import { Router, type IRouter } from "express";
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import { AnalyzeClaimBody } from "@workspace/api-zod";

const router: IRouter = Router();

let genAI: GoogleGenerativeAI | null = null;
const apiKey = process.env.Google_Api_key;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Models tried in order — 1.5-flash has the most generous free tier quota
const MODEL_PRIORITY = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
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
Unsupported statistic, Overgeneralization, Absolute claim, Causal leap, Correlation vs causation, Appeal to authority, Appeal to emotion, Cherry-picked example, Confirmation bias, False certainty, Clickbait language, Speculative prediction, Vague reference, Missing context, Loaded wording, Sensationalism, Scientific-sounding language, AI hallucination signal, Circular reasoning, False dilemma, False equivalence, Slippery slope, Bandwagon, Ad hominem, Appeal to fear, Hasty generalization, Red herring, Missing evidence, Anonymous sourcing, Weak analogy, Oversimplification

WRITING STYLE LABELS (pick 2-4 that best fit, probabilities should sum to ~100):
Human writing, AI-assisted writing, Marketing copy, Academic writing, News reporting, Opinion/editorial, Technical writing, Sales copy, Social media style, Political messaging, Scientific communication, Persuasive essay`;

async function tryGenerateContent(prompt: string): Promise<string> {
  if (!genAI) throw new Error("AI service not configured");
  
  for (const modelName of MODEL_PRIORITY) {
    try {
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
      const is429 = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Too Many Requests") || err?.message?.includes("RESOURCE_EXHAUSTED");
      if (is429 && modelName !== MODEL_PRIORITY[MODEL_PRIORITY.length - 1]) {
        // Try next model
        continue;
      }
      throw err;
    }
  }
  throw new Error("All models exhausted");
}

router.post("/analyze", async (req, res): Promise<void> => {
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
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

  try {
    const responseText = await tryGenerateContent(ANALYSIS_PROMPT(text, wordCount, sentenceCount));

    let analysisResult: Record<string, unknown>;
    try {
      analysisResult = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1]);
      } else {
        const objMatch = responseText.match(/\{[\s\S]*\}/);
        if (objMatch) {
          analysisResult = JSON.parse(objMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }
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
      req.log.warn({ err }, "Gemini API rate limit hit");
      res.status(429).json({
        error: "API quota reached. Your Google AI free-tier limit has been hit. Please wait a minute and try again, or enable billing on your Google AI Studio account for higher limits.",
      });
      return;
    }

    req.log.error({ err }, "AI analysis failed");
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
});

export default router;
