import { useEffect, useState } from "react";
import {
  applyExplorerStateChange,
  getExplorerStep,
  parseExplorerState,
  serializeExplorerState,
} from "./bodyMap.js";
import { HomePage } from "./HomePage.jsx";
import { TutorialLibrary } from "./TutorialLibrary.jsx";
import { OfficeRoutinePage } from "./components/OfficeRoutinePage.jsx";

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
    if (!movementId) delete next.movementId;
    delete next.programId;
    writeUrl(next);
  };

  const navigateHome = () => {
    const next = { ...explorerState, view: "home" };
    delete next.movementId;
    delete next.programId;
    writeUrl(next);
  };

  const navigateOffice = (programId) => {
    const next = { ...explorerState, view: "office", programId };
    delete next.movementId;
    if (!programId) delete next.programId;
    writeUrl(next);
  };

  const navigateView = (view) => {
    if (view === "library") navigateToLibrary();
    else if (view === "office") navigateOffice();
    else navigateHome();
  };

  const openSafety = () => {
    const scrollToSafety = () => document.querySelector("#safety-note")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (urlState.view === "home") {
      scrollToSafety();
      return;
    }
    navigateHome();
    window.setTimeout(scrollToSafety, 0);
  };

  if (urlState.view === "library") {
    return (
      <TutorialLibrary
        initialMovementId={urlState.movementId}
        onNavigateHome={navigateHome}
        onNavigate={navigateView}
        onOpenSafety={openSafety}
      />
    );
  }

  if (urlState.view === "office") {
    return (
      <OfficeRoutinePage
        programId={urlState.programId}
        onSelectProgram={navigateOffice}
        onNavigate={navigateView}
        onOpenSafety={openSafety}
      />
    );
  }

  return (
    <HomePage
      value={explorerState}
      onChange={(next) => {
        const synchronized = applyExplorerStateChange(explorerState, next);
        setExplorerState(synchronized);
        writeUrl({ ...synchronized, view: "home" }, "replace");
      }}
      onOpenTutorial={navigateToLibrary}
      onOpenLibrary={() => navigateToLibrary()}
      onNavigate={navigateView}
      onOpenSafety={openSafety}
    />
  );
}
