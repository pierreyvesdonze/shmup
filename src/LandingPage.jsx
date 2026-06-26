import { useState } from "react";

export default function LandingPage({ onStart }) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    setFading(true);
    setTimeout(() => onStart(), 600);
  };

  return (
    <div
      className="landing"
      style={{
        transition: "opacity 0.6s ease",
        opacity: fading ? 0 : 1,
      }}
    >
      <h1>SHMUP</h1>
      <button onClick={handleStart}>START</button>
      <br /><br />
      <p style={{ color: "white" }}>Use arrow keys to move</p>
      <p style={{ color: "white" }}>Press space to shoot</p>
      <p style={{ color: "white" }}>Press A to safe shoot</p>
      <p style={{ color: "white" }}>Collect power-ups for special abilities!</p>
      <p style={{ color: "white" }}>Avoid enemy bullets!</p>
    </div>
  );
}