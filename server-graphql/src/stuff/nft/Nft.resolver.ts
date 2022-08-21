import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";
import Nft from "./Nft.entity";
import {
  Max,
  Min,
} from "class-validator";
import { Timespan } from "../../utils/timespan";
import {
  SortArg,
  SortDirection,
} from "../../utils/sorting";
import User from "../user/User.entity";
import Trade from "../trade/Trade.entity";
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  LessThan,
  MoreThan,
} from "typeorm";
import { Database } from "../../utils/db";
import { UserInputError } from "apollo-server";
import generateId from "../../utils/generateId";
import { AuthedContext } from "../../utils/Context";
import { SomeRequired } from "../../utils/SomeRequired";

@InputType()
class NftFilters {
  @Field({ nullable: true })
  seedContains?: string

  @Field({ nullable: true })
  minterUsername?: string

  @Field({ nullable: true })
  ownerUsername?: string

  @Field(() => Timespan,{ nullable: true })
  mintDateBetween?: Timespan
}

@ArgsType()
class NftsArgs {
  @Field(() => Int)
  @Min(0)
  skip: number = 0;

  @Field(() => Int)
  @Min(0)
  @Max(100)
  take: number = 10;

  @Field(() => [SortArg], {
    defaultValue: [["mintedAt", SortDirection.DESC]]
  })
  sorts: SortArg[];

  @Field(() => NftFilters, { nullable: true })
  filters?: NftFilters
}

@Resolver(() => Nft)
export class NftResolver implements ResolverInterface<Nft> {
  @Query(() => Nft)
  async nftById(@Arg("id") id: string): Promise<Nft> {
    return Database.manager.findOneOrFail(Nft, {
      where: {
        id
      },
    });
  }

  @Query(() => Nft)
  async nftBySeed(@Arg("seed") seed: string): Promise<Nft> {
    return Database.manager.findOneOrFail(Nft, {
      where: {
        seed
      },
    });
  }

  @Query(() => [Nft])
  async nfts(@Args() args: NftsArgs): Promise<Nft[]> {
    return Database.manager.find(Nft, {
      skip: args.skip,
      take: args.take,
      order: sortsToOrder(args.sorts),
      where: filtersToWhere(args.filters),
    })
  }

  @FieldResolver()
  async minter(@Root() nft: Nft): Promise<User> {
    const dbNft = await Database.manager.findOneOrFail(Nft, {
      where: {
        id: nft.id
      },
      relations: {
        minter: true,
      }
    }) as SomeRequired<Nft, "minter">;

    return dbNft.minter;
  }

  @FieldResolver()
  async owner(@Root() nft: Nft): Promise<User> {
    const dbNft = await Database.manager.findOneOrFail(Nft, {
      where: {
        id: nft.id
      },
      relations: {
        owner: true
      }
    }) as SomeRequired<Nft, "owner">;

    return dbNft.owner;
  }

  @FieldResolver()
  async trades(@Root() nft: Nft): Promise<Trade[]> {
    const dbNft = await Database.manager.findOneOrFail(Nft, {
      where: {
        id: nft.id
      },
      relations: {
        trades: true,
      }
    }) as SomeRequired<Nft, "trades">;

    return dbNft.trades;
  }

  @FieldResolver(() => Trade)
  async lastTrade(@Root() nft: Nft): Promise<Trade | null> {
    const dbNft = await Database.manager.findOneOrFail(Nft, {
      where: {
        id: nft.id
      },
      relations: {
        trades: true,
      }
    }) as SomeRequired<Nft, "trades">;

    // TODO: Do this in DB, so we don't load all trades
    return dbNft.trades.reduce<Trade | null>((currentLast, candidate) => {
      if (currentLast == null) {
        return candidate;
      }

      if (
        candidate.soldAt != null &&
        (
          currentLast.soldAt == null ||
          candidate.soldAt > currentLast.soldAt
        )
      ) {
        return candidate;
      }

      return currentLast;
    }, null);
  }

  @FieldResolver(() => Trade)
  async highestTrade(@Root() nft: Nft): Promise<Trade | null> {
    const dbNft = await Database.manager.findOneOrFail(Nft, {
      where: {
        id: nft.id
      },
      relations: {
        trades: true,
      }
    }) as SomeRequired<Nft, "trades">;

    // TODO: Do this in DB, so we don't load all trades
    return dbNft.trades.reduce<Trade | null>((currentLast, candidate) => {
      if (currentLast == null) {
        return candidate;
      }

      if (
        candidate.soldAt != null &&
        candidate.price > currentLast.price
      ) {
        return candidate;
      }

      return currentLast;
    }, null);
  }

  @Authorized()
  @Mutation(() => Nft)
  async mintNft(@Arg("seed", () => String) seed, @Ctx() ctx: AuthedContext): Promise<Nft> {
    const existingNft = await Database.manager.findOne(Nft, {
      where: {
        seed,
      }
    });

    if (existingNft != null) {
      throw new UserInputError("An NFT with that seed already exists");
    }

    const newNft = Database.manager.create(Nft);
    newNft.id = generateId();
    newNft.seed = seed;
    newNft.mintedAt = new Date();
    newNft.minter = ctx.user;
    newNft.owner = ctx.user;
    newNft.trades = [];
    await Database.manager.save(newNft);

    ctx.user.mintedNfts.push(newNft);
    ctx.user.ownedNfts.push(newNft);
    await Database.manager.save(ctx.user);

    return newNft;
  }
}

function sortsToOrder(sorts: SortArg[]): FindOptionsOrder<Nft> | undefined {
  return sorts.reduce((acc, s) => ({
    ...acc,
    [s.field]: s.direction,
  }), {});
}

function filtersToWhere(filters: NftFilters | undefined): FindOptionsWhere<Nft> | undefined {
  if (filters === undefined) {
    return undefined;
  }

  let where: FindOptionsWhere<Nft> = {};

  if (filters.mintDateBetween != null) {
    if (
      filters.mintDateBetween.from != null &&
      filters.mintDateBetween.to != null
    ) {
      where = {
        ...where,
        mintedAt: Between(filters.mintDateBetween.from, filters.mintDateBetween.to),
      }
    }

    if (
      filters.mintDateBetween.from == null &&
      filters.mintDateBetween.to != null
    ) {
      where = {
        ...where,
        mintedAt: LessThan(filters.mintDateBetween.to),
      }
    }

    if (
      filters.mintDateBetween.from != null &&
      filters.mintDateBetween.to == null
    ) {
      where = {
        ...where,
        mintedAt: MoreThan(filters.mintDateBetween.from),
      }
    }
  }

  if (filters.minterUsername != null) {
    where = {
      ...where,
      minter: {
        username: filters.minterUsername,
      }
    }
  }

  if (filters.ownerUsername != null) {
    where = {
      ...where,
      owner: {
        username: filters.ownerUsername,
      }
    }
  }

  if (filters.seedContains != null) {
    where = {
      ...where,
      seed: ILike(`%${filters.seedContains}%`),
    }
  }

  return where;
}
