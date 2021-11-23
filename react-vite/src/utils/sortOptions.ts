import { Options } from "../shared/Select";
import Sort from "../types/Sort";
import { OverviewNftDTO } from "../../../express-rest/src/features/nfts/getAllNfts";
import { GetAllTradesSort } from "../../../express-rest/src/features/trades/getAllTrades";

export const NFT_SORT_OPTIONS: Options<Sort<OverviewNftDTO>> = [
  {
    label: "Newest first",
    value: ["mintedAt", "desc"],
  },
  {
    label: "Oldest first",
    value: ["mintedAt", "asc"],
  },
  {
    label: "Highest value first",
    value: ["highestSellPrice", "desc"],
  },
  {
    label: "Lowest value first",
    value: ["highestSellPrice", "asc"],
  },
  {
    label: "Seed A → Z",
    value: ["seed", "asc"],
  },
  {
    label: "Seed Z → A",
    value: ["seed", "desc"],
  },
];

export const TRADE_SORT_OPTIONS: Options<GetAllTradesSort> = [
  {
    label: "Newest first",
    value: ["createdAt", "desc"],
  },
  {
    label: "Oldest first",
    value: ["createdAt", "asc"],
  },
  {
    label: "Highest price first",
    value: ["price", "desc"],
  },
  {
    label: "Lowest price first",
    value: ["price", "asc"],
  },
];
