import User from "../user/User.entity";
import { AuthenticationError } from "apollo-server";
import jwt from "jsonwebtoken";
import env from "../../utils/env";
import { Database } from "../../utils/db";
import { ReqRes } from "../../utils/types";
import AuthPayload from "./AuthPayload";
import { Context } from "../../utils/Context";
import { SomeRequired } from "../../utils/SomeRequired";

const getAuthUserContext = async (
  { req, res }: ReqRes
): Promise<Context["user"] | undefined> => {
  const authHeader = req.headers.authorization;

  if (authHeader == undefined) {
    return undefined;
  }

  if (!/^Bearer .+$/.test(authHeader)) {
    throw new AuthenticationError("Invalid authorization header");
  }

  const unvalidatedAuthToken = authHeader.replace(/^Bearer /, "");

  let payload: AuthPayload;

  try {
    payload = jwt.verify(unvalidatedAuthToken, env.AUTH_SECRET) as AuthPayload;
  } catch (error) {
    throw new AuthenticationError("Invalid auth token");
  }

  const user = await Database.manager.findOne(User, {
    where: {
      id: payload.userId
    },
    relations: {
      ownedNfts: true,
      mintedNfts: true,
      boughtTrades: true,
      soldTrades: true,
    }
  }) as SomeRequired<User, (
    | "ownedNfts"
    | "mintedNfts"
    | "boughtTrades"
    | "soldTrades"
  )>;

  if (user == null) {
    throw new AuthenticationError("Logged in user not found");
  }

  return user;
}

export default getAuthUserContext;
