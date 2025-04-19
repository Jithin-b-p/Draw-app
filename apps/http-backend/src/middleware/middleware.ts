import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { AuthRequest } from "../@types/express";

export const middleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"] ?? "";

  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (decoded) {
    req.userId = decoded.userId;
    next();
  } else {
    res.status(403).json({
      message: "unauthorised",
    });
  }
};
