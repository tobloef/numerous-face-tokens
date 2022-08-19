import {
  Field,
  ID,
  ObjectType,
} from "type-graphql";
import User from "../user/User";
import Nft from "../nft/Nft";

@ObjectType()
export default class Trade {
  @Field(() => ID)
  id: string

  @Field()
  createdAt: Date

  @Field()
  seller: User

  @Field({ nullable: true })
  buyer?: User

  @Field()
  sellerAccepted: boolean

  @Field()
  buyerAccepted: boolean

  @Field({ nullable: true })
  soldAt?: Date

  @Field()
  nft: Nft

  @Field()
  price: number
}
