// services/Ai.service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

      const prompt = `
        Analyze the provided images of a medicine and extract these details in strict JSON format:
        {
          "medicine": {
            "name": "Full medicine name (without strength)",
            "strength": "e.g., 500mg, 1g (if visible, else null)",
            "dosageForm": "MUST BE EXACTLY ONE OF: 'tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other' (guess based on packaging, default 'other')"
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
        return this.extractDataFromImage(imageBuffers, retries - 1);
      }
      throw error;
    }
  }
}

module.exports = new AiService();
