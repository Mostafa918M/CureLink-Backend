const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class ImageStorageService {
  async uploadImage(fileBuffer) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ 
          folder: 'medicine-donations',
          transformation: [
            { effect: "contrast:80" },
            { effect: "sharpen" },
            { quality: 100 }], 
          },(error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id, 
          });
        })
        .end(fileBuffer);
    });
  }

  async deleteImage(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}

module.exports = new ImageStorageService();
