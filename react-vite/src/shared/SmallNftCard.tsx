import React from "react";
import styles from "./SmallNftCard.module.css";

const SmallNftCard = (props: {
  seed: string,
  title: string,
  ownerUsername: string,
  mintedAt: Date,
  highestTradePrice?: number,
  to?: string,
}) => {
  return (
    <div style={{
      border: "1px solid black",
      width: 100,
      height: 100,
    }}>

    </div>
  )
};

export default SmallNftCard;
