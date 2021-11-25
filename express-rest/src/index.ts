import dotenv from "dotenv";
dotenv.config({path: "../.env"});

import express from "express";
import http from "http";
import WebSocket from "ws";
import {
  PrismaClient,
  User,
} from "@prisma/client"
import authMiddleware from "./middleware/authMiddleware";
import authRouter from "./routers/authRouter";
import nftsRouter from "./routers/nftsRouter";
import tradesRouter from "./routers/tradesRouter";
import usersRouter from "./routers/usersRouter";
import { createRegisterRoute } from "./utils/expressHandler";
import env from "./utils/env";
import { removePropertiesRecursivelyMiddleware } from "./middleware/removePasswordsMiddleware";
import {
  createNotifier,
  getEventCache,
} from "./eventNotifier";
import cors from "cors";

const prismaClient = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({
  path: "/log",
  server,
});

wss.on("connection", (client) => {
  client.send(JSON.stringify(getEventCache()));
})

const registerRoute = createRegisterRoute({
  prisma: prismaClient,
  notify: createNotifier(wss),
});

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(authMiddleware(prismaClient));
app.use(removePropertiesRecursivelyMiddleware(["passwordHash"]));

app.use(authRouter(registerRoute));
app.use(nftsRouter(registerRoute));
app.use(tradesRouter(registerRoute));
app.use(usersRouter(registerRoute));

server.listen(env.API_PORT, () => {
  console.info(`Started API on port ${env.API_PORT}.`);
});
