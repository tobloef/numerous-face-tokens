import {
  PrismaClient,
  User,
} from "@prisma/client";
import { Notifier } from "../eventNotifier";

type TransactionPrismaClient = Omit<PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$use">;

export type PublicContext = {
  prisma: TransactionPrismaClient,
  notify: Notifier,
};

export type PrivateContext = PublicContext & {
  user: User,
};
