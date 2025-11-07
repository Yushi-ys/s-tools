import { useEffect } from "react";
import Navigation from "@/layout/Navigation";
import Layout from "@/layout";
import { useDevTools } from "@/hooks/useDevTools";
import { useElectronClipboard } from "@/hooks/useElectronClipboard";

import "./App.css";

function App() {
  const { isElectron, startMonitoring, stopMonitoring } =
    useElectronClipboard();

  useDevTools();

  useEffect(() => {
    if (isElectron) {
      // Electron
      startMonitoring();

      return () => {
        stopMonitoring();
      };
    }
  }, [isElectron, startMonitoring, stopMonitoring]);

  return (
    <div style={{ overflow: "hidden" }}>
      <Navigation />
      <Layout />
    </div>
  );
}

export default App;
