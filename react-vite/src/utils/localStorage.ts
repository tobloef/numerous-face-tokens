import AuthPayload from "../../../express-rest/src/types/AuthPayload";

export const getLocalAuthToken = (): string | undefined => {
  // TODO
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoib2pJZEN3ekJwR3piIiwiY3JlYXRlZEF0IjoiMjAyMS0xMS0xM1QxODowOTo1MC45NTNaIiwidXNlcm5hbWUiOiJ1c2VyMSIsImJhbGFuY2UiOjEwMDB9LCJpYXQiOjE2Mzc1MzAwNjB9.UufmnJkWbSBDoTiqgzH-7iFfaitfJ2SNqKedux91JW8"
}

export const getLocalAuthPayload = (): AuthPayload | undefined => {
  // TODO
  return {
    user: {
      id: "ojIdCwzBpGzb",
      createdAt: new Date(),
      username: "user1",
      balance: 1000,
    },
  }
};
