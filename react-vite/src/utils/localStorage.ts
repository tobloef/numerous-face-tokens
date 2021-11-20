import AuthPayload from "../../../express-rest/src/types/AuthPayload";

export const getLocalAuthToken = (): string | undefined => {
  // TODO
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoib0tRM0xqNnljNnZLIiwiY3JlYXRlZEF0IjoiMjAyMS0xMS0xM1QyMToxNjo1Ni4zMjZaIiwidXNlcm5hbWUiOiJ1c2VyMjUiLCJiYWxhbmNlIjoxMDAwfSwiaWF0IjoxNjM2ODM4MjE2fQ.Oya-6-e-BP717VM6PwuHK99L4MZWuExnkcNzPVS10p8"
}

export const getLocalAuthPayload = (): AuthPayload | undefined => {
  return {
    user: {
      id: "oKQ3Lj6yc6vK",
      createdAt: new Date(),
      username: "user25",
      balance: 1000,
    },
  }
};
