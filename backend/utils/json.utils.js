export const safeParseJSON = (rawText) => {
  try {
    if (!rawText) return null;

    const cleaned = String(rawText)
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

export const extractJsonFromText = (text) => {
  try {
    if (!text) return null;
    const match = String(text).match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
};

export const parseAIJSON = (rawText) => safeParseJSON(rawText) || extractJsonFromText(rawText);
