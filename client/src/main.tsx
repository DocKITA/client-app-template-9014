import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { Auth0Provider } from '@auth0/auth0-react'
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
    
    <Auth0Provider
        domain={process.env.REACT_APP_AUTH0_DOMAIN as string}
        clientId={process.env.REACT_APP_AUTH0_CLIENT_ID as string}
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
        <App />
    </Auth0Provider>

)
