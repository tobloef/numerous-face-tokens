import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import Nft from "../nft/Nft";
import Trade from "../trade/Trade";

@ObjectType()
export default class User {
  @Field(() => ID)
  id: string

  @Field()
  createdAt: Date

  @Field()
  username: string

  @Field()
  balance: number

  @Field(() => [Nft])
  ownedNfts: [Nft]

  @Field(() => [Nft])
  mintedNfts: [Nft]

  @Field(() => [Trade])
  boughtTrades: [Trade]

  @Field(() => [Trade])
  soldTrades: [Trade]
}
