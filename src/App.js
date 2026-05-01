// deploy trigger
import React, { useState } from "react";
import ScoreSheet from "./scoresheet";
import Leaderboard from "./leaderboard";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [judgeName, setJudgeName] = useState("");
  const [eventLocked, setEventLocked] = useState(false);

  const ADMIN_PASSWORD = "autofest123"; // 🔐 CHANGE THIS

  const btn = {
    width: "100%",
    padding: 16,
    margin: 6,
    fontSize: 18
  };

  // HOME
  if (screen === "home") {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={btn} onClick={() => setScreen("login")}>
          Judge Login
        </button>

        <button style={btn} onClick={() => setScreen("leader")}>
          Leaderboard
        </button>

        <button style={btn} onClick={() => setScreen("adminLogin")}>
          Admin Login
        </button>
      </div>
    );
  }

  // JUDGE LOGIN
  if (screen === "login") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Judge Login</h2>

        <input
          placeholder="Judge Name"
          onChange={(e) => setJudgeName(e.target.value)}
        />

        <button onClick={() => setScreen("score")}>Start</button>
      </div>
    );
  }

  // SCORE
  if (screen === "score") {
    return (
      <ScoreSheet
        judgeName={judgeName}
        eventLocked={eventLocked}
      />
    );
  }

  // LEADERBOARD
  if (screen === "leader") {
    return <Leaderboard />;
  }

  // ADMIN LOGIN
  if (screen === "adminLogin") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Admin Login</h2>

        <input
          type="password"
          placeholder="Password"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.target.value === ADMIN_PASSWORD) {
                setScreen("admin");
              } else {
                alert("Wrong password");
              }
            }
          }}
        />

        <button onClick={() => setScreen("home")}>Back</button>
      </div>
    );
  }

  // ADMIN PANEL
  if (screen === "admin") {
    return (
      <div style={{ padding: 20 }}>
        <h2>ADMIN PANEL</h2>

        <button onClick={() => setEventLocked(true)}>
          🔒 Lock Event
        </button>

        <button onClick={() => setEventLocked(false)}>
          🔓 Unlock Event
        </button>

        <button
          onClick={() => {
            alert("Archive event (safe copy retained)");
          }}
        >
          📦 Archive Event
        </button>

        <button onClick={() => setScreen("home")}>
          Back
        </button>
      </div>
    );
  }

  return null;
}
