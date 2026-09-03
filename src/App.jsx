import { lazy, Suspense, useEffect, useState } from "react";
import {
  applyExplorerStateChange,
  getExplorerStep,
  parseExplorerState,
  serializeExplorerState,
} from "./bodyMap.js";
import { buildLibraryPath, readLibraryLocation } from "./libraryRouting.js";

const HomePage = lazy(() => import("./HomePage.jsx").then((module) => ({ default: module.HomePage })));
const TutorialLibrary = lazy(() => import("./TutorialLibrary.jsx").then((module) => ({ default: module.TutorialLibrary })));
const OfficeRoutinePage = lazy(() => import("./components/OfficeRoutinePage.jsx").then((module) => ({ default: module.OfficeRoutinePage })));

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

function AppLoading() {
  return <div className="app-loading" role="status">MOVE LAB 正在准备动作内容…</div>;
}

function loadPage(page) {
  return <Suspense fallback={<AppLoading />}>{page}</Suspense>;
}

function readUrlState() {
  if (typeof window === "undefined") return { view: "home", ...defaultExplorerState };
  const explorerLocation = parseExplorerState(window.location.search);
  const libraryLocation = readLibraryLocation(window.location.pathname, window.location.search);
  return synchronizeExplorerStep({
    ...defaultExplorerState,
    ...explorerLocation,
    ...libraryLocation,
  });
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

  const writeUrl = (next, mode = "push", pathname = import.meta.env.BASE_URL ?? "/") => {
    const synchronized = synchronizeExplorerStep(next);
    const search = serializeExplorerState(synchronized);
    window.history[`${mode}State`]({}, "", `${pathname}${search}`);
    setUrlState(synchronized);
  };

  const navigateToLibrary = (movementId) => {
    const next = { ...explorerState, view: "library", movementId };
    if (!movementId) delete next.movementId;
    delete next.programId;
    if (movementId) {
      const synchronized = synchronizeExplorerStep(next);
      window.history.pushState(
        {},
        "",
        buildLibraryPath(
          movementId,
          import.meta.env.BASE_URL ?? "/",
          window.location.hostname.endsWith(".chatgpt.site") ? "query" : "path",
        ),
      );
      setUrlState(synchronized);
      return;
    }
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
    return loadPage(
      <TutorialLibrary
        initialMovementId={urlState.movementId}
        onNavigateHome={navigateHome}
        onNavigate={navigateView}
        onOpenSafety={openSafety}
        onSelectMovement={navigateToLibrary}
      />,
    );
  }

  if (urlState.view === "office") {
    return loadPage(
      <OfficeRoutinePage
        programId={urlState.programId}
        onSelectProgram={navigateOffice}
        onNavigate={navigateView}
        onOpenSafety={openSafety}
      />,
    );
  }

  return loadPage(
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
    />,
  );
}
