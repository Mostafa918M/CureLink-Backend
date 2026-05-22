// services/imagePreprocessing.service.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

class ImagePreprocessingService {

  async preprocessImage(buffer) {
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const tempPath = path.join(TEMP_DIR, `curelink-${Date.now()}-${uniqueId}.jpg`);

    const processedBuffer = await sharp(buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: false,
      })
      .greyscale()
      .normalize()
      .clahe({ width: 8, height: 8, maxSlope: 3 })
      .sharpen({ sigma: 1.2, m1: 1.0, m2: 0.5 })
      .jpeg({ quality: 95, progressive: true })
      .toBuffer();

    await fs.writeFile(tempPath, processedBuffer);
    return { processedBuffer, tempPath };
  }

  async cleanupTempFile(tempPath) {
    try {
      await fs.unlink(tempPath);
    } catch {
    }
  }
}

module.exports = new ImagePreprocessingService();
