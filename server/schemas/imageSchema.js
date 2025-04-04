import { uploadFile, getAuthenticationParameters } from "../utils/imagekit.js";
import { requireAuth } from "../utils/auth.js";

export const typeDefs = `#graphql
  type ImageUploadResult {
    url: String!
    fileId: String!
    name: String!
    size: Int
    filePath: String
    thumbnailUrl: String
  }

  type ImageKitAuthParams {
    token: String!
    expire: Int!
    signature: String!
  }

  input ImageUploadInput {
    file: String!
    fileName: String!
    folder: String
  }

  extend type Mutation {
    uploadImage(input: ImageUploadInput!): ImageUploadResult!
    getImageKitAuthParams: ImageKitAuthParams!
  }
`;

export const resolvers = {
  Mutation: {
    uploadImage: requireAuth(async (_, { input }) => {
      try {
        const { file, fileName, folder = "books" } = input;

        //upload
        const result = await uploadFile(file, fileName, folder);

        return {
          url: result.url,
          fileId: result.fileId,
          name: result.name,
          size: result.size,
          filePath: result.filePath,
          thumbnailUrl: result.thumbnailUrl,
        };
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    }),

    getImageKitAuthParams: requireAuth(async () => {
      try {
        const authParams = getAuthenticationParameters();
        return authParams;
      } catch (error) {
        console.error("Error getting ImageKit auth params:", error);
        throw new Error(`Failed to get ImageKit auth params: ${error.message}`);
      }
    }),
  },
};
