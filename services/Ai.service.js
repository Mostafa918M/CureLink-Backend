// services/Ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MEDICINE_CATEGORIES } = require('../models/medicine.model');

class AiService {
  async extractDataFromImage(imageBuffers, retries = 3) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const imageParts = imageBuffers.map((buffer) => ({
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      }));

      const categoryList = MEDICINE_CATEGORIES.map((c) => `'${c}'`).join(', ');

      const prompt = `

      You are an OCR + medicine packaging analysis system.
      Analyze the provided images of a medicine and extract these details in strict JSON format:

      IMPORTANT OCR RULES:
      - Medicine packages may contain embossed, blurry, low-contrast, tilted, partially hidden, or noisy text.
      - Infer missing characters intelligently using pharmaceutical packaging conventions.
      - Expiry dates MUST always be later than manufacturing dates.
      - Prices usually end with currency like LE, EGP, $, etc.
      - Batch numbers are usually alphanumeric.
      - If only MM/YYYY exists for dates:
      - manufacturingDate => use first day of month
      - expiryDate => use last day of month
      - If a value is uncertain, return the MOST LIKELY value instead of null whenever reasonable.
      - Never hallucinate impossible values.
      Return STRICTLY this JSON schema only:
        {
          "medicine": {
            "name": "Full medicine name (without strength)",
            "strength": "e.g., 500mg, 1g (if visible, else null)",
            "dosageForm": "MUST BE EXACTLY ONE OF: 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other' (guess based on packaging, default 'other')",
            "category": "MUST BE EXACTLY ONE OF: ${categoryList}. Choose the most appropriate category based on the medicine's known therapeutic use. Default to 'Other' if uncertain."
          },
          "donation": {
            "manufacturingDate": "YYYY-MM-DD or null",
            "expiryDate": "YYYY-MM-DD (If only MM/YYYY is visible, use the last day of that month)",
            "quantityAmount": "Number of units visible (integer)",
            "quantityUnit": "MUST BE EXACTLY ONE OF: 'box', 'bottle', 'strip', 'unit'",
            "batchNumber": "Batch or Lot number if visible, else null",
            "conditionNotes": "Brief description of the physical condition of the packaging"
          }
        }
        Requirements:
        - Return ONLY the raw JSON object. Do not wrap it in markdown code blocks like \`\`\`json.
        - The "category" field is mandatory; always provide a value from the allowed list above.
        - No markdown.
        - No explanations.
        - No extra text.
        - "dosageForm" MUST be EXACTLY one of:
          ["tablet","capsule","syrup","injection","cream","drops","other"]

        - "quantityUnit" MUST be EXACTLY one of:
          ["box","bottle","strip","unit"]

        - "category" MUST be EXACTLY one value from:
          ${categoryList}

        - If category is uncertain use "Other".
        - Dates MUST be valid real dates.
        - expiryDate MUST be after manufacturingDate.
        - If only MM/YYYY is visible:
          expiryDate => last day of month
          manufacturingDate => first day of month`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = response.text();

      text = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not find JSON in AI response');

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      if (retries > 0 && error.message.includes('503')) {
        console.log(`Server busy, retrying... (${retries} left)`);
        await new Promise((res) => setTimeout(res, 2000));
        return this.extractDataFromImage(imageBuffers, retries - 1);
      }
      throw error;
    }
  }
}

module.exports = new AiService();
