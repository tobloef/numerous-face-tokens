import express from "express";
import { login, setupLoginRequest } from "../features/auth/login";
import { setupSignupRequest, signup } from "../features/auth/signup";
import { RegisterRoute } from "../utils/expressHandler";

const makeRouter = (registerRouter: RegisterRoute): express.Router => {
    const router = express.Router();

    registerRouter({
        path: "/login",
        method: "post",
        feature: login,
        setupRequest: setupLoginRequest,
        auth: false,
        router,
    });

    registerRouter({
        path: "/signup",
        method: "post",
        feature: signup,
        setupRequest: setupSignupRequest,
        auth: false,
        router,
    });

    return router;
}

export default makeRouter;