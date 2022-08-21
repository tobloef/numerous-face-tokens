import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Resolver,
} from "type-graphql";
import bcrypt from "bcryptjs";
import User from "../user/User.entity";
import { Database } from "../../utils/db";
import {
  AuthenticationError,
  UserInputError,
} from "apollo-server";
import generateId from "../../utils/generateId";
import AuthToken from "./AuthToken";
import jwt from "jsonwebtoken";
import AuthPayload from "./AuthPayload";
import env from "../../utils/env";

@ArgsType()
class RegisterUserArgs {
  @Field(() => String)
  username: string
  @Field(() => String)
  password: string
}

@ArgsType()
class LoginUserArgs {
  @Field(() => String)
  username: string
  @Field(() => String)
  password: string
}


@Resolver()
export class AuthResolver {
  @Mutation(() => String)
  async register(@Args() { username, password }: RegisterUserArgs): Promise<AuthToken> {
    const existingUser = await Database.manager.findOne(User, {
      where: {
        username,
      }
    });

    const VALID_USERNAME_REGEX = /^[a-z0-9]{1,20}$/i;

    if (!VALID_USERNAME_REGEX.test(username)) {
      throw new UserInputError("Invalid username");
    }

    if (existingUser != null) {
      throw new UserInputError("A user with that username already exists");
    }

    const passwordHash = bcrypt.hashSync(password);

    let newUser = Database.manager.create(User, {
      id: generateId(),
      balance: 1000,
      username,
      passwordHash,
      createdAt: new Date(),
      mintedNfts: [],
      ownedNfts: [],
      boughtTrades: [],
      soldTrades: [],
    });
    newUser = await Database.manager.save(User, newUser);

    console.debug("newUser.ownedNfts", newUser.ownedNfts);

    const authPayload: AuthPayload = {
      userId: newUser.id,
      username: newUser.username,
    };

    const token: AuthToken = jwt.sign(authPayload, env.AUTH_SECRET);

    return token;
  }

  @Mutation(() => String)
  async login(@Args() { username, password }: LoginUserArgs): Promise<AuthToken> {
    const user = await Database.manager.findOne(User, {
      where: {
        username,
      }
    });

    if (user == null) {
      throw new UserInputError("No user not found");
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      throw new AuthenticationError("Wrong password");
    }

    const authPayload: AuthPayload = {
      userId: user.id,
      username: user.username,
    };

    const token: AuthToken = jwt.sign(authPayload, env.AUTH_SECRET);

    return token;
  }
}
