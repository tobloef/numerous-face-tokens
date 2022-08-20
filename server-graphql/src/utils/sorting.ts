import {
  Field,
  InputType,
  registerEnumType,
} from "type-graphql";

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

registerEnumType(SortDirection, {
  name: "SortDirection",
})

@InputType()
export class SortArg {
  @Field()
  field: string
  @Field(() => SortDirection)
  direction: SortDirection
}
