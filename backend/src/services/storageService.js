const { v2: cloudinary } = require('cloudinary');

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
  configured = true;
}

function useMockCloudinary() {
  return process.env.NODE_ENV === 'test' || process.env.CLOUDINARY_MOCK === 'true';
}

async function uploadToCloudinary(imageBuffer) {
  ensureCloudinaryConfig();
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error('imageBuffer inválido para upload');
  }

  if (useMockCloudinary()) {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      url: `https://mock-cloudinary.local/${mockId}.png`,
      public_id: `mural_lince/${mockId}`,
    };
  }

  const base64Image = imageBuffer.toString('base64');
  const result = await cloudinary.uploader.upload(
    `data:image/png;base64,${base64Image}`,
    {
      folder: process.env.CLOUDINARY_FOLDER || 'mural_lince',
      resource_type: 'image',
      overwrite: false,
    },
  );

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

async function deleteFromCloudinary(publicId) {
  ensureCloudinaryConfig();
  if (!publicId) return;

  if (useMockCloudinary()) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};
