import { ok } from "neverthrow";
import UseCase from "../../UseCase";

type UpdateUserRequest = {
    username: string,
};

type UpdateUserResponse = {

};

const updateUser: UseCase<UpdateUserRequest, UpdateUserResponse> = async (request, ctx) => {
    return ok({});
};

export default updateUser;