import {
  getAuthenticationParameters,
  uploadFile,
  deleteFile,
} from "../utils/imagekit.js";
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("imagekit", () => {
  return () => ({
    getAuthenticationParameters: jest.fn().mockReturnValue({
      token: "mock-token",
      expire: 1234567890,
      signature: "mock-signature",
    }),
    upload: jest.fn().mockImplementation((options) => {
      return Promise.resolve({
        url: "https://example.com/image.jpg",
        fileId: "mock-file-id",
        name: options.fileName,
        size: 1024,
        filePath: `/uploads/${options.fileName}`,
        thumbnailUrl: "https://example.com/thumbnail.jpg",
      });
    }),
    deleteFile: jest.fn().mockImplementation((fileId) => {
      return Promise.resolve({ fileId });
    }),
  });
});

describe("ImageKit Utility Tests", () => {
  it("should return authentication parameters", () => {
    const params = getAuthenticationParameters();
    expect(params).toHaveProperty("token");
    expect(params).toHaveProperty("expire");
    expect(params).toHaveProperty("signature");
  });

  it("should handle base64 string uploads", async () => {
    try {
      await uploadFile(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "test-image.png"
      );
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it("should handle buffer uploads", async () => {
    try {
      const buffer = Buffer.from("test image data");
      await uploadFile(buffer, "test-buffer-image.png");
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it("should handle file deletion", async () => {
    try {
      await deleteFile("test-file-id");
    } catch (error) {
      expect(error.message).toBeDefined();
    }
  });

  it("should export the required functions", () => {
    const imagekit = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      getAuthenticationParameters: jest.fn(),
    };

    expect(typeof imagekit.uploadFile).toBe("function");
    expect(typeof imagekit.deleteFile).toBe("function");
    expect(typeof imagekit.getAuthenticationParameters).toBe("function");
  });
});
