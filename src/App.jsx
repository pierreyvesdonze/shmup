import { useState, useEffect } from "react";
import LandingPage from "./LandingPage";
import startGame from "./game/main.js";

export default function App() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) {
      startGame();
    }
  }, [started]);

  return (
    <>
      {started ? (
        <>
          <h1 style={{ textAlign: "center", color: "black" }}>
            SHMUP
          </h1>

          <div
            id="game-container"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          />
        </>
      ) : (
        <LandingPage onStart={() => setStarted(true)} />
      )}
    </>
  );
}