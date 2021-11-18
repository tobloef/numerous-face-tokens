import React from "react";
import Input from "../shared/Input";
import classes from "./NFtsOverview.module.css";

const NftsOverview: React.FC<{}> = (props) => {
  // TODO
  return (
    <div className={classes.nftsOverview}>
      <div className={classes.createNftWrapper}>
        <h3 className={classes.createNftTitle}>Create new NFT</h3>
        <div className={classes.createNftInputWrapper}>
          <Input
            onChange={}
            value={}
          />
          <button>Create</button>
        </div>
        {existingNft != null && (
          <SmallNftCard
            seed={existingNft.seed}
            title={existingNft.title}
            ownerUsername={existingNft.ownerUsername}
            mintedAt={existingNft.mintedAt}
          />
        )}
      </div>
      <div className={classes.nftListWrapper}>
        <div className={classes.nftListHeader}>
          <h2>NFTs</h2>
          <div className={classes.sortByWrapper}>
            <span>Sort by</span>
            <Select></Select>
          </div>
        </div>
        <div className={classes.nftList}>
          {nfts.map((nft: Nft) => (
            <SmallNftCard
              seed={nft.seed}
              title={nft.title}
              ownerUsername={nft.ownerUsername}
              mintedAt={nft.mintedAt}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NftsOverview;
