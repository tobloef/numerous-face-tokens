import { PrismaClient } from "@prisma/client";
import User from "./User";

type TransactionPrismaClient = Omit<PrismaClient,
    | '$connect'
    | '$disconnect'
    | '$on'
    | '$transaction'
    | '$use'
>;

export type PublicContext = {
    prisma: TransactionPrismaClient,
};

export type PrivateContext = PublicContext & {
    user: User,
};
