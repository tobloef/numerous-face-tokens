import { User } from "@prisma/client";
import Never from "./Never";

type AuthPayload = {
    user: Never<User, "passwordHash">,
}

export default AuthPayload;