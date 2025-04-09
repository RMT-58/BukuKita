import "dotenv/config";

import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

//buat uploadnya
export const uploadFile = async (file, fileName, folder = "books") => {
  try {
    if (typeof file === "string" && file.includes("base64")) {
      const result = await imagekit.upload({
        file,
        fileName,
        folder,
      });
      return result;
    }

    //bufferfile
    if (Buffer.isBuffer(file)) {
      const result = await imagekit.upload({
        file,
        fileName,
        folder,
      });
      return result;
    }

    throw new Error("Invalid file format");
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

//buat auth
export const getAuthenticationParameters = () => {
  return imagekit.getAuthenticationParameters();
};

//delete
export const deleteFile = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    return result;
  } catch (error) {
    console.error("ImageKit delete error:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

export default imagekit;
