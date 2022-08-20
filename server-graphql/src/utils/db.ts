import { DataSource } from "typeorm";
import Nft from "../types/nft/Nft.entity";
import User from "../types/user/User.entity";
import Trade from "../types/trade/Trade.entity";

export const Database = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  synchronize: true,
  entities: [Nft, User, Trade]
});
