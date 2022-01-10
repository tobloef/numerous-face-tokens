import express from "express";
import {
  getAllUsers,
  setupGetAllUsersRequest,
} from "../features/users/getAllUsers";
import {
  getUser,
  setupGetUserRequest,
} from "../features/users/getUser";
import {
  setupUpdateUserRequest,
  updateUser,
} from "../features/users/updateUser";
import { RegisterRoute } from "../utils/expressHandler";

const makeRouter = (registerRoute: RegisterRoute): express.Router => {
  const router = express.Router();

  registerRoute({
    path: "/users",
    method: "get",
    feature: getAllUsers,
    setupRequest: setupGetAllUsersRequest,
    auth: false,
    router,
  });

  registerRoute({
    path: "/users/:username",
    method: "get",
    feature: getUser,
    setupRequest: setupGetUserRequest,
    auth: false,
    router,
  });

  registerRoute({
    path: "/users/:username",
    method: "patch",
    feature: updateUser,
    setupRequest: setupUpdateUserRequest,
    auth: true,
    router,
  });

  return router;
}

export default makeRouter;
