import WebSocket from "ws";
import Markdown from "./types/Markdown";

const cache: NotificationEvent[] = [];

export type NotificationEvent = {
    time: Date,
    title: string,
    description: Markdown,
};

export type Notifier = (event: NotificationEvent) => void;

export const createNotifier = (wss: WebSocket.Server): Notifier => {
    return  (event) => {
        if (wss === undefined) {
            throw new Error("Cannot send notification, WebSocket Server not set up yet");
        }

        const newLength = cache.unshift(event);

        if (newLength > 10) {
            cache.pop();
        }

        wss.clients.forEach((ws) => {
            ws.send(JSON.stringify(event));
        });
    }
}

export const getEventCache = () => {
    return cache;
}
