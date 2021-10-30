import User from "../../src/types/User";

declare module 'express-serve-static-core' {
    interface Request {
        user?: User
    }
}