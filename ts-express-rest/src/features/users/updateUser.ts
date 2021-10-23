import express from "express";
import Context from "../../types/Context";
import Feature from "../../types/feature";
import SetupRequest from "../../types/SetupRequest";

type UpdateUserRequest = {
    username: string,
};

type UpdateUserResponse = UserDTO[];

type UserDTO = {

};

export const updateUser: Feature<UpdateUserRequest, UpdateUserResponse> = async (
    request: UpdateUserRequest,
    ctx: Context,
) => {
    
};

export const setupUpdateUserRequest: SetupRequest<UpdateUserRequest> = (
    req: express.Request,
    res: express.Response,
) => {

}