import { AuthChecker } from "type-graphql";
import { Context } from "vm";

const gqlAuthChecker: AuthChecker<Context> = ({ context }, roles) => {
  return context.user != null;
}

export default gqlAuthChecker;
