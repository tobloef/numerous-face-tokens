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

  @Column()
  passwordHash: string

  @ManyToOne(() => Nft, (nft) => nft.owner, { nullable: false })
  @Field(() => [Nft])
  ownedNfts?: Nft[]

  @ManyToOne(() => Nft, (nft) => nft.minter, { nullable: false })
  @Field(() => [Nft])
  mintedNfts?: Nft[]

  @ManyToOne(() => Trade, (trade) => trade.buyer, { nullable: false })
  @Field(() => [Trade])
  boughtTrades?: Trade[]

  @ManyToOne(() => Trade, (trade) => trade.seller, { nullable: false })
  @Field(() => [Trade])
  soldTrades?: Trade[]
}
