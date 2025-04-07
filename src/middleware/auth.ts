import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { logger } from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
  user?: any;
  role?: string;
}

interface JwtPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
      role?: string;
    }
  }
}

// Authenticate middleware to verify JWT
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    // Check if Bearer token format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Authorization format must be Bearer <token>" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "default_jwt_secret";

    try {
      // Verify token
      const decoded = jwt.verify(token, secret) as JwtPayload;

      // Check token expiration explicitly
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        return res.status(401).json({ message: "Token has expired" });
      }

      // Set user data to request object
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired" });
      }
      return res.status(401).json({ message: "Token verification failed" });
    }
  } catch (error) {
    logger.error("Authentication error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Authorize middleware to check user roles
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You don't have permission to access this resource",
      });
    }

    next();
  };
};
