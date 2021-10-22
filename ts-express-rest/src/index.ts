import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: "../.env" });

const prisma = new PrismaClient();

const app = express();

app.get('/', async (req, res) => {
  const users = await prisma.user.findMany()
  res.send(`Hello, World! We got ${users.length} users.`);
});

app.listen(process.env.API_PORT, () => {
  console.info(`Started API on port ${process.env.API_PORT}.`);
});