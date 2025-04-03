import jwt from "jsonwebtoken";
import User from "../models/user.js";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "rahasia";

export function generateToken(user) {
  return jwt.sign({ _id: user._id, username: user.username }, SECRET_KEY, {
    expiresIn: "7d",
  });
}

//verify token
export function verifyToken(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return null;
  }
}

// get auth user dr token
export async function getUserFromToken(token) {
  try {
    if (!token) return null;

    //apus "Bearer " kalo ada
    const tokenWithoutBearer = token.startsWith("Bearer ")
      ? token.slice(7)
      : token;

    const decoded = verifyToken(tokenWithoutBearer);
    if (!decoded || !decoded._id) return null;

    const user = await User.findUserById(decoded._id);
    return user;
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
}

//aauth check buat resolvers
export function requireAuth(resolver) {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new Error("Authentication required");
    }
    return resolver(parent, args, context, info);
  };
}
