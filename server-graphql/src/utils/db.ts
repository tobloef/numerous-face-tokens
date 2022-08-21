import {
  Column,
  DataSource,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import Nft from "../stuff/nft/Nft.entity";
import User from "../stuff/user/User.entity";
import Trade from "../stuff/trade/Trade.entity";
import env from "./env";

export const Database = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.DB_NAME,
  username: env.DB_USER,
  password: env.DB_PASS,
  synchronize: true,
  dropSchema: true,
  entities: [Nft, Trade, User],
});
