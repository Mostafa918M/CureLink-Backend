// services/Ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MEDICINE_CATEGORIES } = require('../models/medicine.model');
const imagePreprocessingService = require('./imagePreprocessing.service');

class AiService {
  async extractDataFromImage(imageBuffers, retries = 3) {
    const preprocessResults = await Promise.all(
      imageBuffers.map(async (buffer) => {
        try {
          return await imagePreprocessingService.preprocessImage(buffer);
        } catch (err) {
          console.error('Image preprocessing failed, using original buffer:', err.message);
          return { processedBuffer: buffer, tempPath: null };
        }
      }),
    );

    const tempPaths = preprocessResults.map((r) => r.tempPath).filter(Boolean);

    try {
      return await this._callGemini(
        preprocessResults.map((r) => r.processedBuffer),
        retries,
      );
    } finally {
      await Promise.all(tempPaths.map((p) => imagePreprocessingService.cleanupTempFile(p)));
    }
  }

  async _callGemini(processedBuffers, retries) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const imageParts = processedBuffers.map((buffer) => ({
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: 'image/jpeg',
        },
      }));

      const categoryList = MEDICINE_CATEGORIES.map((c) => `'${c}'`).join(', ');

      const prompt = `
        Analyze the provided images of a medicine and extract these details in strict JSON format:
        {
          "medicine": {
            "name": "Full medicine name (without strength)",
            "strength": "e.g., 500mg, 1g (if visible, else null)",
            "dosageForm": "MUST BE EXACTLY ONE OF: 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other' (guess based on packaging, default 'other')",
            "category": "MUST BE EXACTLY ONE OF: ${categoryList}. Choose the most appropriate category based on the medicine's known therapeutic use. Default to 'Other' if uncertain."
          },
          "donation": {
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
      `;

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
        return this._callGemini(processedBuffers, retries - 1);
      }
      throw error;
    }
  }
}

module.exports = new AiService();
