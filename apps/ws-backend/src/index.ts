import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

const checkUser = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    return null;
  }
};

wss.on("connection", (socket, req) => {
  const url = req.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") ?? "";

  const userId = checkUser(token);

  if (!userId) {
    socket.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    socket,
  });

  socket.on("message", async (data: string) => {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "join_room") {
      const user = users.find((user) => user.socket === socket);

      user?.rooms.push(parsedData.slug);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((user) => user.socket === socket);

      if (!user) return;
      user.rooms = user.rooms.filter((room) => room !== parsedData.slug);
    }

    if (parsedData.type === "chat") {
      const { roomId, slug, message } = parsedData;

      await prismaClient.chat.create({
        data: {
          roomId: parseInt(roomId),
          userId,
          message,
        },
      });
      users.forEach((user) => {
        if (user.rooms.includes(slug)) {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              message,
              slug,
            })
          );
        }
      });
    }
  });
});
