import React from "react";
import styles from "./SmallNftCard.module.css";
import { Link } from "react-router-dom";

const SmallNftCard = (props: {
  seed: string,
  ownerUsername: string,
  mintedAt: Date,
  highestTradePrice?: number,
  to?: string,
}) => {
  return (
    <Link
      className={styles.link}
      to={`/nfts/${props.seed}`}
    >
      <div className={styles.smallNftCard}>
        <img src={`https://server.tobloef.com/faces/${props.seed}.png`} />
        <span className={styles.seed}>{props.seed}</span>
        <span>
          Owner: {props.ownerUsername}
        </span>
      </div>
    </Link>
  )
};

export default SmallNftCard;
