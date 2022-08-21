import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import User from "../user/User.entity";
import Trade from "../trade/Trade.entity";
import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

@Entity()
@ObjectType()
export default class Nft {
  @PrimaryColumn()
  @Field(() => ID)
  id: string

  @Column()
  @Field()
  seed: string

  @Column()
  @Field()
  mintedAt: Date

  @ManyToOne(() => User, (user) => user.mintedNfts)
  @Field(() => User, { nullable: true })
  minter?: User

  @ManyToOne(() => User, (user) => user.ownedNfts)
  @Field(() => User, { nullable: false })
  owner?: User

  @ManyToMany(() => Trade)
  @Field(() => [Trade], { nullable: false })
  trades?: Trade[]
}