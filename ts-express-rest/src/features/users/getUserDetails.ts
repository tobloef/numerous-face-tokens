import { ok } from "neverthrow";
import UseCase from "../../UseCase";

type GetUserDetailsRequest = {
    username: string,
};

type GetUserDetailsResponse = {

};

const getUserDetails: UseCase<GetUserDetailsRequest, GetUserDetailsResponse> = async (request, ctx) => {
    return ok({});
};

export default getUserDetails;