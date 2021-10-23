import { ok } from "neverthrow";
import UseCase from "../../UseCase";

type CreateUserRequest = {
    username: string,
};

type CreateUserResponse = {

};

const createUser: UseCase<CreateUserRequest, CreateUserResponse> = async (request, ctx) => {
    return ok({});
};

export default createUser;