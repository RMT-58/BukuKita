// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.jsx";
// import {
//   ApolloProvider,
//   ApolloClient,
//   createHttpLink,
//   InMemoryCache,
// } from "@apollo/client";
// import { setContext } from "@apollo/client/link/context";

// const httpLink = createHttpLink({
//   uri: "http://localhost:4000/",
// });

// const authLink = setContext((_, { headers }) => {
//   // Ambil token dari localStorage untuk web
//   const token = localStorage.getItem("access_token");
//   console.log("TOKEN:", token);

//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     },
//   };
// });

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <ApolloProvider client={client}>
//       <App />
//     </ApolloProvider>
//   </StrictMode>
// );

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ApolloProvider } from "@apollo/client";
import client from "./config/apollo.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
);
