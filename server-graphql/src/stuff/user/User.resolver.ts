import {
  Arg,
  ArgsType,
  Field,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";
import User from "../user/User.entity";
import { Database } from "../../utils/db";
import Nft from "../nft/Nft.entity";
import Trade from "../trade/Trade.entity";
import { SomeRequired } from "../../utils/SomeRequired";

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


@Resolver(() => User)
export class UserResolver implements ResolverInterface<User> {
  @Query(() => User)
  async userById(@Arg("id") id: string): Promise<User> {
    return Database.manager.findOneOrFail(User, {
      where: {
        id
      },
    });
  }

  @Query(() => User)
  async userByUsername(@Arg("username") username: string): Promise<User> {
    return Database.manager.findOneOrFail(User, {
      where: {
        username
      },
    });
  }

  @FieldResolver()
  async ownedNfts(@Root() user: User): Promise<Nft[]> {
    const dbUser = await Database.manager.findOneOrFail(User, {
      where: {
        id: user.id
      },
      relations: {
        ownedNfts: true,
      }
    }) as SomeRequired<User, "ownedNfts">;

    return dbUser.ownedNfts;
  }

  @FieldResolver()
  async mintedNfts(@Root() user: User): Promise<Nft[]> {
    const dbUser = await Database.manager.findOneOrFail(User, {
      where: {
        id: user.id
      },
      relations: {
        mintedNfts: true,
      }
    }) as SomeRequired<User, "mintedNfts">;

    return dbUser.mintedNfts;
  }

  @FieldResolver()
  async boughtTrades(@Root() user: User): Promise<Trade[]> {
    const dbUser = await Database.manager.findOneOrFail(User, {
      where: {
        id: user.id
      },
      relations: {
        boughtTrades: true,
      }
    }) as SomeRequired<User, "boughtTrades">;

    return dbUser.boughtTrades;
  }

  @FieldResolver()
  async soldTrades(@Root() user: User): Promise<Trade[]> {
    const dbUser = await Database.manager.findOneOrFail(User, {
      where: {
        id: user.id
      },
      relations: {
        soldTrades: true,
      }
    }) as SomeRequired<User, "soldTrades">;

    return dbUser.soldTrades;
  }
}