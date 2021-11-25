import React, {
  useEffect,
  useState,
} from "react";
import styles from "./Dashboard.module.css";
import { CURRENCY_SYMBOL } from "../../../express-rest/src/utils/constants";
import {
  connectEventLog,
  parseDate,
} from "../utils/api";
import { NotificationEvent } from "../../../express-rest/src/eventNotifier";
// @ts-ignore
import ReactMarkdown from "react-markdown";
// @ts-ignore
import ReactTimeAgo from "react-time-ago"
import { Link } from "react-router-dom";

const Dashboard: React.FC<{}> = (props) => {
  const [events, setEvents] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    const ws = connectEventLog();

    ws.addEventListener("message", (e) => {
      const eventOrEvents = JSON.parse(e.data);
      const events = Array.isArray(eventOrEvents)
        ? eventOrEvents
        : [eventOrEvents];

      const parsedEvents = events.map((event) => ({
        ...event,
        time: parseDate(event.time),
      }))

      setEvents((prevEvents) => [
        ...parsedEvents,
        ...prevEvents,
      ]);
    })

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.infoWrapper}>
        <p className={styles.header}>
          Welcome to Numerous Face Tokens
        </p>
        <p className={styles.explainer}>
          This site is a mock trading platform for Numerous Face Tokens (NFTs).
          Each NFT is randomly generated from a specified "seed" that you enter when you create a new NFT.
          When signing up, you automatically gain {CURRENCY_SYMBOL}1000, the currency of this site,
          which you can use to buy and sell NFTs.
          <br/>
          <br/>
          Numerous Face Tokens was created as an attempt to compare multiple web technology stacks
          and you can find the source code <a href={"https://github.com/tobloef/numerous-face-tokens"}>on GitHub</a>.
          The version of the site you are currently viewing, was made with TypeScript, React.js, Express.js and Prisma.
          <br/>
          <br/>
          ~ Tobias ☺
        </p>
      </div>

      <div className={styles.eventLog}>
        <h2>Live Event Log</h2>
        <div className={styles.eventList}>
          {events.map((event) => (
            <div
              key={`${event.title}_${event.description}_${event.time}`}
              className={styles.event}
            >
              <div className={styles.eventHeader}>
                <span className={styles.eventTitle}>
                  <b>{event.title}</b>
                </span>
                <span className={styles.eventTime}>
                  <ReactTimeAgo date={event.time}/>
                </span>
              </div>
              <div className={styles.eventDescription}>
                <ReactMarkdown
                  skipHtml={true}
                  components={{
                    a: (props) => (
                      <Link to={props.href ?? ""}>{props.children}</Link>
                    ),
                  }}
                >
                  {event.description}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
};

export default Dashboard;
