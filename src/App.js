import React, { useState, useEffect } from "react";
import ScoreSheet from "./scoresheet";
import Leaderboard from "./leaderboard";

import { db } from "./firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [eventName, setEventName] = useState("");
  const [judges, setJudges] = useState(["", "", "", "", "", ""]);
  const [activeJudge, setActiveJudge] = useState("");
  const [eventLocked, setEventLocked] = useState(false);

  useEffect(() => {
    if (!eventName) return;

    const unsub = onSnapshot(doc(db, "events", eventName), (docSnap) => {
      if (docSnap.exists()) {
        setEventLocked(docSnap.data().locked);
      }
    });

    return () => unsub();
  }, [eventName]);

  const startEvent = async () => {
    const valid = judges.filter((j) => j.trim() !== "");
    if (!eventName) return alert("Enter event name");
    if (valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);

    await setDoc(doc(db, "events", eventName), {
      locked: false
    });

    setScreen("judge");
  };

  const lockEvent = async () => {
    await setDoc(doc(db, "events", eventName), { locked: true });
  };

  const unlockEvent = async () => {
    await setDoc(doc(db, "events", eventName), { locked: false });
  };

  const btn = {
    padding: 12,
    margin: 8,
    fontSize: 18,
    borderRadius: 6
  };

  // HOME
  if (screen === "home") {
    return (
      <div style={{ textAlign: "center", padding: 30 }}>
        <h1>🏁 AUTOFEST SERIES</h1>

        <button style={btn} onClick={() => setScreen("setup")}>
          Start Event
        </button>

        <button style={btn} onClick={() => setScreen("judge")}>
          Judge Login
        </button>

        <button style={btn} onClick={() => setScreen("leader")}>
          Leaderboard
        </button>
      </div>
    );
  }

  // SETUP
  if (screen === "setup") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Event Setup</h2>

        <input
          style={{ fontSize: 18, padding: 10, width: "100%" }}
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        {judges.map((j, i) => (
          <input
            key={i}
            style={{ display: "block", marginTop: 10 }}
            placeholder={`Judge ${i + 1}`}
            onChange={(e) => {
              const copy = [...judges];
              copy[i] = e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button style={btn} onClick={startEvent}>
          Start Event
        </button>
      </div>
    );
  }

  // JUDGE LOGIN
  if (screen === "judge") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Select Judge</h2>

        {judges.map((j, i) => (
          <button
            key={i}
            style={btn}
            onClick={() => {
              setActiveJudge(j);
              setScreen("score");
            }}
          >
            {j}
          </button>
        ))}
      </div>
    );
  }

  // SCORE
  if (screen === "score") {
    return (
      <div style={{ padding: 20 }}>
        <h2>{eventName}</h2>
        <h3>Judge: {activeJudge}</h3>

        {eventLocked && (
          <h2 style={{ color: "red" }}>🔒 EVENT LOCKED</h2>
        )}

        <button onClick={lockEvent}>Lock</button>
        <button onClick={unlockEvent}>Unlock</button>

        <ScoreSheet
          eventName={eventName}
          judgeName={activeJudge}
          eventLocked={eventLocked}
        />
      </div>
    );
  }

  // LEADERBOARD
  if (screen === "leader") {
    return (
      <div style={{ padding: 20 }}>
        <Leaderboard eventName={eventName} />
      </div>
    );
  }

  return null;
}
