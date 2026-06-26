export default function LandingPage({ onStart }) {
  return (
    <div className="landing">
      <h1>SHMUP</h1>

      <button onClick={onStart}>
        START
      </button>

      <br />
      <br />
        <p style={{ color: "white" }}>Use arrow keys to move</p>
        <p style={{ color: "white" }}>Press space to shoot</p>
        <p  style={{ color: "white" }}>Press A to safe shoot</p>
        <p style={{ color: "white" }}>Collect power-ups for special abilities!</p>
        <p style={{ color: "white" }}>Avoid enemy bullets!</p>
    </div>
  );
}