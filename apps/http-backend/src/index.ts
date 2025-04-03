import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware/middleware";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/validation";

const app = express();

app.post("/signin", (req, res) => {
  const data = SignInSchema.safeParse(req.body);
  if (!data.success) {
    res.json({
      message: "invalid inputs",
    });
    return;
  }

  const userId = 1;
  const token = jwt.sign(
    {
      userId,
    },
    JWT_SECRET
  );

  res.json({ token });
});

app.post("/signup", (req, res) => {
  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    res.json({
      message: "invlid inputs",
    });

    return;
  }

  res.json({
    userId: 1,
  });
});

app.post("/room", middleware, (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);

  if (!data.success) {
    res.json({
      message: "invalid inputs",
    });
    return;
  }

  res.json({
    name: "reees",
  });
});

app.listen(3001);
