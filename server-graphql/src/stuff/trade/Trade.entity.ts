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
  ManyToOne,
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

  @ManyToOne(() => Nft, (nft) => nft.trades)
  @Field(() => Nft, { nullable: false })
  nft?: Nft

  @ManyToOne(() => User, (user) => user.soldTrades)
  @Field(() => User, { nullable: false })
  seller?: User

  @ManyToOne(() => User, (user) => user.boughtTrades, { nullable: true })
  @Field(() => User, { nullable: true })
  buyer?: User
}
