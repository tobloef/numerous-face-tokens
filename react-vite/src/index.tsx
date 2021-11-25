import React from "react"
import ReactDOM from "react-dom"
import { ReactQueryDevtools } from "react-query/devtools"
import App from "./App"
import { BrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "react-query";
import "./index.css"
import TimeAgo from "javascript-time-ago"
import en from "javascript-time-ago/locale/en.json"

TimeAgo.addDefaultLocale(en)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.NODE_ENV === "production" ? "/nft/react/" : "/"}>
      <QueryClientProvider client={queryClient}>
        <App/>
        <ReactQueryDevtools initialIsOpen={false}/>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root"),
)
