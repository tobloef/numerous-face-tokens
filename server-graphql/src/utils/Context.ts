import User from "../stuff/user/User.entity";
import { SomeRequired } from "./SomeRequired";

type Context = {
  user?: SomeRequired<User, (
    | "boughtTrades"
    | "soldTrades"
    | "ownedNfts"
    | "mintedNfts"
  )>,
};

export default Context;
