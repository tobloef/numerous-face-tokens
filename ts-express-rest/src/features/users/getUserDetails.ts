import express from "express";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";

type GetUserDetailsRequest = {
    username: string,
};

type GetUserDetailsResponse = UserDTO[];

type UserDTO = {

};

export const getUserDetails: Feature<GetUserDetailsRequest, GetUserDetailsResponse> = async (
    request: GetUserDetailsRequest,
    ctx: Context,
) => {
    
};

export const setupGetUserDetailsRequest: SetupRequest<GetUserDetailsRequest> = (
    req: express.Request,
    res: express.Response,
) => {

}