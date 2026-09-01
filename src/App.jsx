import { useEffect, useState } from "react";
import {
  getExplorerStep,
  parseExplorerState,
  selectRegionState,
  serializeExplorerState,
} from "./bodyMap.js";
import { HomePage } from "./HomePage.jsx";
import { TutorialLibrary } from "./TutorialLibrary.jsx";

const defaultExplorerState = {
  regionId: undefined,
  targetIds: [],
  targetSides: {},
  symptomIds: [],
  redFlagIds: [],
  viewSide: "front",
  step: 1,
};

function synchronizeExplorerStep(state) {
  return { ...state, step: getExplorerStep(state) };
}

function readUrlState() {
  if (typeof window === "undefined") return { view: "home", ...defaultExplorerState };
  return synchronizeExplorerStep({ ...defaultExplorerState, ...parseExplorerState(window.location.search) });
}

export function App() {
  const [urlState, setUrlState] = useState(readUrlState);
  const [explorerState, setExplorerState] = useState(() => ({
    ...defaultExplorerState,
    ...readUrlState(),
  }));

  useEffect(() => {
    const restore = () => {
      const next = readUrlState();
      setUrlState(next);
      setExplorerState(next);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const writeUrl = (next, mode = "push") => {
    const synchronized = synchronizeExplorerStep(next);
    const search = serializeExplorerState(synchronized);
    window.history[`${mode}State`]({}, "", `${window.location.pathname}${search}`);
    setUrlState(synchronized);
  };

  const navigateToLibrary = (movementId) => {
    const next = { ...explorerState, view: "library", movementId };
    writeUrl(next);
  };

  const navigateHome = () => {
    const next = { ...explorerState, view: "home" };
    delete next.movementId;
    writeUrl(next);
  };

  if (urlState.view === "library") {
    return (
      <TutorialLibrary
        initialMovementId={urlState.movementId}
        onNavigateHome={navigateHome}
      />
    );
  }

  return (
    <HomePage
      value={explorerState}
      onChange={(next) => {
        const regionState = next.regionId === explorerState.regionId
          ? next
          : selectRegionState(next, next.regionId);
        const synchronized = synchronizeExplorerStep(regionState);
        setExplorerState(synchronized);
        writeUrl({ ...synchronized, view: "home" }, "replace");
      }}
      onOpenTutorial={navigateToLibrary}
    />
  );
}
