import {
  Arg,
  Args,
  ArgsType,
  Field,
  FieldResolver,
  InputType,
  Int,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from "type-graphql";
import Nft from "./Nft";
import {
  Max,
  Min,
} from "class-validator";
import { Timespan } from "../../utils/timespan";
import {
  SortArg,
  SortDirection,
} from "../../utils/sorting";
import User from "../user/User";
import Trade from "../trade/Trade";
import {
  Between,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  LessThan,
  MoreThan,
  Repository,
} from "typeorm";

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
  constructor(
    private repo: Repository<Nft>
  ) {}


  @Query(() => Nft)
  async nftById(@Arg("id") id: string): Promise<Nft> {
    return this.repo.findOneOrFail({
      where: {
        id
      },
    });
  }

  @Query(() => Nft)
  async nftBySeed(@Arg("seed") seed: string): Promise<Nft> {
    return this.repo.findOneOrFail({
      where: {
        seed
      },
    });
  }

  @Query(() => [Nft])
  async nfts(@Args() args: NftsArgs): Promise<Nft[]> {
    return this.repo.find({
      skip: args.skip,
      take: args.take,
      order: sortsToOrder(args.sorts),
      where: filtersToWhere(args.filters),
    })
  }

  @FieldResolver()
  async minter(@Root() nft: Nft): Promise<User> {
    const dbNft = await this.repo.findOneOrFail({
      where: {
        id: nft.id
      }
    });

    return dbNft.minter;
  }

  @FieldResolver()
  async owner(@Root() nft: Nft): Promise<User> {
    const dbNft = await this.repo.findOneOrFail({
      where: {
        id: nft.id
      }
    });

    return dbNft.owner;
  }

  @FieldResolver()
  async trades(@Root() nft: Nft): Promise<Trade[]> {
    const dbNft = await this.repo.findOneOrFail({
      where: {
        id: nft.id
      }
    });

    return dbNft.trades;
  }

  @FieldResolver()
  async lastTrade(@Root() nft: Nft): Promise<Trade | null> {
    const dbNft = await this.repo.findOneOrFail({
      where: {
        id: nft.id
      }
    });

    // TODO: Do this in DB, so we don't load all trades
    return (await dbNft.trades).reduce<Trade | null>((currentLast, candidate) => {
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

  @FieldResolver()
  async highestTrade(@Root() nft: Nft): Promise<Trade | null> {
    const dbNft = await this.repo.findOneOrFail({
      where: {
        id: nft.id
      }
    });

    // TODO: Do this in DB, so we don't load all trades
    return (await dbNft.trades).reduce<Trade | null>((currentLast, candidate) => {
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
