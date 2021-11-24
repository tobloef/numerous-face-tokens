import WebSocket from "ws";
import Markdown from "./types/Markdown";

const cache: NotificationEvent[] = [];

export type NotificationEvent = {
    time: Date,
    title: Markdown,
    description: Markdown,
    image?: string,
};

export type Notifier = (event: NotificationEvent) => void;

export const createNotifier = (wss: WebSocket.Server): Notifier => {
    return  (event) => {
        if (wss === undefined) {
            throw new Error("Cannot send notification, WebSocket Server not set up yet");
        }

        const newLength = cache.push(event);

        if (newLength > 10) {
            cache.shift();
        }

        wss.clients.forEach((ws) => {
            ws.send(JSON.stringify(event));
        });
    }
}

export const getEventCache = () => {
    return cache;
}
