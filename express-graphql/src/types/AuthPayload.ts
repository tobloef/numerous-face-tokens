import { User } from "@prisma/client";

type AuthPayload = {
  user: Omit<User, "passwordHash">,
}

export default AuthPayload;
