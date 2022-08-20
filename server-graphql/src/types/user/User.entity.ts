import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import Nft from "../nft/Nft.entity";
import Trade from "../trade/Trade.entity";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity()
@ObjectType()
export default class User {
  @PrimaryColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field()
  createdAt: Date

  @Column()
  @Field()
  username: string

  @Column()
  @Field()
  balance: number

  @ManyToOne(() => Nft, (nft) => nft.owner)
  @Field(() => [Nft])
  ownedNfts: [Nft]

  @ManyToOne(() => Nft, (nft) => nft.minter)
  @Field(() => [Nft])
  mintedNfts: [Nft]

  @ManyToOne(() => Trade, (trade) => trade.buyer)
  @Field(() => [Trade])
  boughtTrades: [Trade]

  @ManyToOne(() => Trade, (trade) => trade.seller)
  @Field(() => [Trade])
  soldTrades: [Trade]
}
