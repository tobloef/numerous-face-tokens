import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import User from "../user/User.entity";
import Nft from "../nft/Nft.entity";
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";

@Entity()
@ObjectType()
export default class Trade {
  @PrimaryColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field()
  createdAt: Date

  @Column()
  @Field()
  sellerAccepted: boolean

  @Column()
  @Field()
  buyerAccepted: boolean

  @Column({ nullable: true })
  @Field({ nullable: true })
  soldAt?: Date

  @Column()
  @Field()
  price: number

  @OneToMany(() => Nft, (nft) => nft.trades)
  @Field(() => Nft)
  nft: Nft

  @OneToMany(() => User, (user) => user.soldTrades)
  @Field(() => User)
  seller: User

  @OneToMany(() => User, (user) => user.boughtTrades, { nullable: true })
  @Field(() => User, { nullable: true })
  buyer?: User
}
