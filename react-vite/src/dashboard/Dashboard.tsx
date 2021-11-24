import React from "react";
import styles from "./Dashboard.module.css";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";

const Dashboard: React.FC<{

}> = (props) => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.infoWrapper}>
        <p className={styles.header}>
          Welcome Numerous Face Tokens
        </p>
        <p className={styles.explainer}>
          This site is a mock trading platform for Numerous Face Tokens (NFTs).
          Each NFT is randomly generated from a specified "seed" that you enter when you create a new NFT.
          When signing up, you automatically gain {CURRENCY_SYMBOL}1000, the currency of this site,
          which you can use to buy and sell NFTs.
          <br />
          <br />
          Numerous Face Tokens was created as an attempt to compare multiple web technology stacks
          and you can find the source code <a href={"https://github.com/tobloef/numerous-face-tokens"}>on GitHub</a>.
          The version of the site you are currently viewing, was made with TypeScript, React.js, Express.js and Prisma.
        </p>
      </div>
      <div>

      </div>
    </div>
  )
};

export default Dashboard;
