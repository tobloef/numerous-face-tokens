import { PrismaClient } from "@prisma/client";

type Context = {
    prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>,
};

export default Context;