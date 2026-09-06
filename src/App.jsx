import { useEffect, useRef, useCallback } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { setupTheme } from "./theme";
import "@excalidraw/excalidraw/index.css";

const LOCAL_ORIGIN = "local";
const SIGNALING_URL = import.meta.env.VITE_SYNC_SERVER_URL || "ws://localhost:1234";

export default function App() {
  const excalidrawAPIRef = useRef(null);
  const ydoc = useRef(new Y.Doc()).current;
  const yElements = useRef(ydoc.getArray("elements")).current;
  const debounceRef = useRef(null);

  useEffect(() => {
    const provider = new WebsocketProvider(SIGNALING_URL, "whiteboard-room-id", ydoc);

    setupTheme(ydoc);

    const observer = (event, transaction) => {
      if (transaction.origin === LOCAL_ORIGIN) return;
      if (!excalidrawAPIRef.current) return;
      excalidrawAPIRef.current.updateScene({ elements: yElements.toArray() });
    };
    yElements.observe(observer);

    return () => {
      yElements.unobserve(observer);
      provider.destroy();
    };
  }, [ydoc, yElements]);

  const handleChange = useCallback(
    (newElements) => {
      const snapshot = [...newElements];
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        ydoc.transact(() => {
          yElements.delete(0, yElements.length);
          yElements.push(snapshot);
        }, LOCAL_ORIGIN);
      }, 50);
    },
    [ydoc, yElements]
  );

  return (
    <div style={{ height: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <Excalidraw
        excalidrawAPI={(api) => (excalidrawAPIRef.current = api)}
        onChange={handleChange}
      />
    </div>
  );
}