import React, {
  useEffect,
  useState,
} from "react";
import Input from "../shared/Input";
import Select, { Options } from "../shared/Select";
import SmallNftCard from "../shared/SmallNftCard";
import {
  GetAllNftsResponse,
  OverviewNftDTO,
} from "../../../express-rest/src/features/nfts/getAllNfts";
import { useQuery } from "react-query";
import { getAllNfts } from "../utils/api";
import Sort from "../types/Sort";
import styles from "./NFtsOverview.module.css";
import Grid from "../shared/Grid";

const sortOptions: Options<Sort<OverviewNftDTO>> = [
  {
    label: "Oldest first",
    value: ["mintedAt", "asc"],
  },
  {
    label: "Newest first",
    value: ["mintedAt", "desc"],
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
  {
    label: "Title A → Z",
    value: ["title", "asc"],
  },
  {
    label: "Title Z → A",
    value: ["title", "desc"],
  },
]

const NftsOverview: React.FC<{}> = (props) => {
  const PAGE_SIZE = 10;

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort<OverviewNftDTO>>(["mintedAt", "desc"]);
  const [existingNft, setExistingNft] = useState<OverviewNftDTO>();
  const [mintNftLoading, setMintNftLoading] = useState(false);
  const [newNftSeed, setNewNftSeed] = useState<string>("");

  const {
    isLoading,
    isError,
    data,
    error,
  } = useQuery<GetAllNftsResponse, Error>(
    ["getAllNfts", page, sort],
    () => getAllNfts({
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      sorts: [sort],
    }),
    {
      retry: false
    }
  );

  return (
    <div className={styles.nftsOverview}>
      <div className={styles.mintNftWrapper}>
        <h3 className={styles.mintNftTitle}>Mint new NFT</h3>
        <div className={styles.mintNftInputWrapper}>
          <Input
            onChange={setNewNftSeed}
            value={newNftSeed}
          />
          <button
            disabled={mintNftLoading || newNftSeed === ""}
          >
            Mint
          </button>
        </div>
        {existingNft != null && (
          <div className={styles.nftExistsWrapper}>
            <span>An NFT with that seed already exists</span>
            <SmallNftCard
              seed={existingNft.seed}
              title={existingNft.title}
              ownerUsername={existingNft.ownerUsername}
              mintedAt={existingNft.mintedAt}
            />
          </div>
        )}
      </div>
      <Grid
        title={"NFTs"}
        sort={sort}
        onSortChange={setSort}
        sortOptions={sortOptions}
        items={data?.nfts}
        loading={isLoading}
        error={isError ? error?.message ?? "Error fetching NFTs" : undefined}
        keyProp={"seed"}
        renderItem={(nft: OverviewNftDTO) => (
          <SmallNftCard
            seed={nft.seed}
            title={nft.title}
            ownerUsername={nft.ownerUsername}
            mintedAt={nft.mintedAt}
            to={`/nfts/${nft.seed}`}
          />
        )}
      />
    </div>
  );
};

export default NftsOverview;
