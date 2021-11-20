import { User } from "@prisma/client";
import Never from "./Never";

type AuthPayload = {
    user: Omit<User, "passwordHash">,
}

export default AuthPayload;
