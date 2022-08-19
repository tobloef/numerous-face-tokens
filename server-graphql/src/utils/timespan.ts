import {
  Field,
  InputType,
} from "type-graphql";

@InputType()
export class Timespan {
  @Field({ nullable: true })
  from?: Date
  @Field({ nullable: true })
  to?: Date
}
