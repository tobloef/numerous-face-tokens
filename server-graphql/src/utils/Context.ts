import User from "../stuff/user/User.entity";
import { SomeRequired } from "./SomeRequired";

export type Context = {
  user?: SomeRequired<User, (
    | "boughtTrades"
    | "soldTrades"
    | "ownedNfts"
    | "mintedNfts"
    )>,
};

export type AuthedContext = SomeRequired<Context, "user">;
