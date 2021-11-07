import WebSocket from "ws";
import Markdown from "./types/Markdown";

export type NotificationEvent = {
    time: Date,
    title: Markdown,
    description: Markdown,
};

export type Notifier = (event: NotificationEvent) => void;

export const createNofitier = (wss: WebSocket.Server): Notifier => {
    return  (event) => {
        if (wss === undefined) {
            throw new Error("Cannot send notification, WebSocket Server not set up yet");
        }

        wss.clients.forEach((ws) => {
            ws.send(JSON.stringify(event));
        });
    }
}