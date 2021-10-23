import { ok } from "neverthrow";
import UseCase from "../../UseCase";

type GetUsersOverviewRequest = {
    username: string,
};

type GetUsersOverviewResponse = {

};

const getUsersOverview: UseCase<GetUsersOverviewRequest, GetUsersOverviewResponse> = async (request, ctx) => {
    return ok({});
};

export default getUsersOverview;