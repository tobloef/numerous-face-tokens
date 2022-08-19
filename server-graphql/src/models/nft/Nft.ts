import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import User from "../user/User";
import Trade from "../trade/Trade";
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
  @Field()
  minter: Promise<User>

  @ManyToOne(() => User, (user) => user.ownedNfts)
  @Field()
  owner: Promise<User>

  @ManyToMany(() => Trade)
  @Field(() => [Trade])
  trades: Promise<Trade[]>
}
