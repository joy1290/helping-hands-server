
import { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

let JWKS: ReturnType<typeof createRemoteJWKSet> | undefined;

function getJWKS() {
  const authURL = process.env.BETTER_AUTH_URL;

  if (!authURL) {
    throw new Error("BETTER_AUTH_URL is missing");
  }

  const jwksURL = new URL("/api/auth/jwks", authURL);

  JWKS ??= createRemoteJWKSet(jwksURL);

  return { JWKS, authURL };
}

export async function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Bearer token required.",
      });
      return;
    }

    const token = authHeader.slice(7);
    const { JWKS, authURL } = getJWKS();

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authURL,
      audience: authURL,
    });

    if (!payload.sub) {
      res.status(401).json({
        success: false,
        message: "User ID missing from token.",
      });
      return;
    }

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error: any) {
    console.error("JWT ERROR NAME:", error?.name);
    console.error("JWT ERROR CODE:", error?.code);
    console.error("JWT ERROR MESSAGE:", error?.message);

    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}
