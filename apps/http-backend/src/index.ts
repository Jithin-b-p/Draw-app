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
import { comparePassword, hashPassword } from "./util/helper";
import { AuthRequest } from "./@types/express";

const app = express();

app.use(express.json());

app.post("/signin", async (req, res) => {
  const parsedData = SignInSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "invalid inputs",
    });

    return;
  }

  let user = null;
  try {
    user = await prismaClient.user.findUnique({
      where: {
        email: parsedData.data.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "server error!!" });
  }

  if (!user) {
    res.status(401).json({ message: "user not found!!" });
    return;
  }

  const verify =
    user && (await comparePassword(parsedData.data.password, user.password));

  if (verify) {
    const userId = user && user.id;
    const token = jwt.sign(
      {
        userId,
      },
      JWT_SECRET
    );

    res.json({ token });
  } else {
    res.status(401).json({ message: "Password incorrect!!" });
  }
});

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      message: "invalid inputs",
    });

    return;
  }

  const hashedPassword = await hashPassword(parsedData.data.password);

  try {
    const user = await prismaClient.user.create({
      data: {
        email: parsedData.data.username,
        password: hashedPassword,
        name: parsedData.data.name,
      },
    });

    res.json({
      userId: user.id,
    });
  } catch (error) {
    res.status(401).json({ message: "user already exists!!" });
  }
});

app.post("/room", middleware, async (req: AuthRequest, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.json({
      message: "invalid inputs",
    });
    return;
  }

  if (!req.userId) {
    res.status(401).json({ message: "unauthorised!!" });
    return;
  }

  const room = await prismaClient.room.create({
    data: {
      slug: parsedData.data.name,
      adminId: req.userId,
    },
  });

  res.json({
    roomId: room.id,
  });
});

app.listen(3001);
