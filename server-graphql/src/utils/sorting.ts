import {
  Field,
  InputType,
  registerEnumType,
} from "type-graphql";

export enum SortDirection {
  ASC = "ASC",
  DESC = "DESC",
}

console.debug("registerEnumType", registerEnumType);

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
