import express from "express";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";

type GetUsersOverviewRequest = {
    username: string,
};

type GetUsersOverviewResponse = UserDTO[];

type UserDTO = {

};

export const getUsersOverview: Feature<GetUsersOverviewRequest, GetUsersOverviewResponse> = async (
    request: GetUsersOverviewRequest,
    ctx: Context,
) => {
    
};

export const setupGetUsersOverviewRequest: SetupRequest<GetUsersOverviewRequest> = (
    req: express.Request,
    res: express.Response,
) => {

}