import { PrismaClient, User } from "@prisma/client";

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
