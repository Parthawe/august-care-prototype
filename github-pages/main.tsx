import React from "react";
import { createRoot } from "react-dom/client";
import "../app/globals.css";
import { AugustV2Prototype } from "../app/AugustV2Prototype";
import { getCompleteJourneyLocation } from "../app/prototypeV2Machine";

const query = new URLSearchParams(window.location.search);
const location = getCompleteJourneyLocation(query.get("state") ?? undefined);
const root = document.getElementById("root");

if (!root) throw new Error("August Care root element was not found");

createRoot(root).render(
  <React.StrictMode>
    <AugustV2Prototype
      completeJourney
      initialFlow={location.flow}
      initialState={location.state}
    />
  </React.StrictMode>,
);
