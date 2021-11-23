import React, {
  useState,
} from "react";
import Input from "../shared/Input";
import NftCard from "./NftCard";
import {
  GetAllNftsResponse,
  OverviewNftDTO,
} from "../../../express-rest/src/features/nfts/getAllNfts";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import * as api from "../utils/api";
import Sort from "../types/Sort";
import styles from "./NFtsOverview.module.css";
import Grid from "../shared/Grid";
import {
  CreateNftRequest,
  CreateNftResponse,
} from "../../../express-rest/src/features/nfts/createNft";
import { useGlobalState } from "../utils/globalState";
import {
  NFT_SORT_OPTIONS,
} from "../utils/sortOptions";

const NftsOverview: React.FC<{}> = (props) => {
  const PAGE_SIZE = 8 * 3;

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort<OverviewNftDTO>>(["mintedAt", "desc"]);
  const [newNftSeed, setNewNftSeed] = useState<string>("");
  const queryClient = useQueryClient();
  const [authPayload] = useGlobalState('authPayload');

  const {
    isLoading: isNftsLoading,
    isError: isNftsError,
    data: nftsData,
    error: nftsError,
  } = useQuery<GetAllNftsResponse, Error>(
    ["getAllNfts", page, sort],
    () => api.getAllNfts({
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      sorts: [sort],
    }),
  );

  const {
    mutate: mintNft,
    isLoading: isMintNftLoading,
    isError: isMintNftError,
    error: mintNftError,
    data: mintNftData,
    reset: resetMintNft,
  } = useMutation<CreateNftResponse, Error, CreateNftRequest>(
    async (request) => {
      const nft = await api.mintNft(request);
      queryClient.invalidateQueries("getAllNfts");
      setNewNftSeed("");
      return nft;
    },
  );

  return (
    <div className={styles.nftsOverview}>
      {authPayload?.user !== undefined && (
        <div className={styles.mintNftWrapper}>
          <h3 className={styles.mintNftTitle}>Mint new NFT</h3>
          <div className={styles.mintNftInputWrapper}>
            <form onSubmit={(e) => {
              e.preventDefault();
              mintNft({seed: newNftSeed});
            }}>
              <Input
                onChange={(newValue) => {
                  resetMintNft();
                  setNewNftSeed(newValue);
                }}
                value={newNftSeed}
                placeholder="Seed"
              />
              <button
                type="submit"
                disabled={isMintNftLoading || newNftSeed === ""}
              >
                Mint
              </button>
            </form>
          </div>
          {isMintNftError && (
            <span>{mintNftError?.message ?? "Error minting NFT"}</span>
          )}
          {mintNftData != null && (
            <>
              <span className={styles.mintSuccess}>
                Successfully minted NFT!
              </span>
              <NftCard
                seed={mintNftData.seed}
                ownerUsername={mintNftData.owner.username}
              />
            </>
          )}
        </div>
      )}
      <Grid
        title={<h1>NFTs</h1>}
        sort={sort}
        onSortChange={setSort}
        sortOptions={NFT_SORT_OPTIONS}
        items={nftsData?.nfts}
        loading={isNftsLoading}
        error={isNftsError ? nftsError?.message ?? "Error fetching NFTs" : undefined}
        keyProp={"seed"}
        page={page}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        totalElements={nftsData?.totalCount}
        renderItem={(nft: OverviewNftDTO) => (
          <NftCard
            seed={nft.seed}
            ownerUsername={nft.ownerUsername}
            to={`/nfts/${nft.seed}`}
          />
        )}
      />
    </div>
  );
};

export default NftsOverview;
