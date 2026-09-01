import { useEffect, useState } from "react";
import { parseExplorerState, serializeExplorerState } from "./bodyMap.js";
import { HomePage } from "./HomePage.jsx";
import { TutorialLibrary } from "./TutorialLibrary.jsx";

const defaultExplorerState = {
  regionId: undefined,
  targetIds: [],
  symptomIds: [],
  redFlagIds: [],
};

function readUrlState() {
  if (typeof window === "undefined") return { view: "home", ...defaultExplorerState };
  return { ...defaultExplorerState, ...parseExplorerState(window.location.search) };
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
      setExplorerState((current) => ({ ...current, ...next }));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);

  const writeUrl = (next, mode = "push") => {
    const search = serializeExplorerState(next);
    window.history[`${mode}State`]({}, "", `${window.location.pathname}${search}`);
    setUrlState(next);
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
        setExplorerState(next);
        writeUrl({ ...next, view: "home" }, "replace");
      }}
      onOpenTutorial={navigateToLibrary}
    />
  );
}
