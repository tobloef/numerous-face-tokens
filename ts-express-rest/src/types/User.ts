import { UserWithPassword } from "@prisma/client";
import Never from "./Never";

type User = Never<UserWithPassword, "passwordHash">;

export default User;