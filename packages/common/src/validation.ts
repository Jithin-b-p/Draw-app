import { z } from "zod";

export const CreateUserSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(18),
  name: z.string(),
});

export const SignInSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8).max(18),
});

export const CreateRoomSchema = z.object({
  name: z.string().min(3).max(20),
});
