import { PrismaClient } from "@prisma/client";
import User from "./User";

type TransactionPrismaClient = Omit<PrismaClient,
    | '$connect'
    | '$disconnect'
    | '$on'
    | '$transaction'
    | '$use'
>;

type Context = {
    prisma: TransactionPrismaClient,
    user: User,
};

export default Context;