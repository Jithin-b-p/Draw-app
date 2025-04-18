import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { middleware } from "./middleware/middleware";
import {
  CreateUserSchema,
  SignInSchema,
  CreateRoomSchema,
} from "@repo/common/validation";
import { prismaClient } from "@repo/db/client";

const app = express();

app.use(express.json());

app.post("/signin", (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
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

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "invalid inputs",
    });

    return;
  }

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: parsedData.data.password,
        name: parsedData.data.name,
      },
    });

    res.json({
      userId: user.id,
    });
  } catch (error) {
    res.status(411).json({ message: "user already exists!!" });
  }
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
