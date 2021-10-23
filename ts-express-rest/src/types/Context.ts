import { PrismaClient } from "@prisma/client";

type Context = {
    prisma: PrismaClient,
};

export default Context;