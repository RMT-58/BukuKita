import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {
  ApolloProvider,
  // ApolloClient,
  // createHttpLink,
  // InMemoryCache,
} from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";
import { AppProvider } from "./context/AppContext.jsx";
import client from "./config/apollo.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProvider>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </AppProvider>
  </StrictMode>
);
