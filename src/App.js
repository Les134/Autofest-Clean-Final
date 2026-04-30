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

  if (screen === "home") {
    return (
      <div style={{ padding: 20 }}>
        <h1>🏁 AUTOFEST SERIES</h1>
        <button onClick={() => setScreen("setup")}>New Event</button>
        <button onClick={() => setScreen("judge")}>Judge Login</button>
        <button onClick={() => setScreen("leader")}>Leaderboard</button>
      </div>
    );
  }

  if (screen === "setup") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Event Setup</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        {judges.map((j, i) => (
          <input
            key={i}
            placeholder={`Judge ${i + 1}`}
            onChange={(e) => {
              const copy = [...judges];
              copy[i] = e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button onClick={startEvent}>Start Event</button>
      </div>
    );
  }

  if (screen === "judge") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Select Judge</h2>

        {judges.map((j, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveJudge(j);
              setScreen("score");
            }}
          >
            {j}
          </button>
        ))}

        <button onClick={() => setScreen("home")}>Home</button>
      </div>
    );
  }

  if (screen === "score") {
    return (
      <div style={{ padding: 20 }}>
        <h3>{eventName} | {activeJudge}</h3>

        {eventLocked && (
          <h2 style={{ color: "red" }}>🔒 EVENT LOCKED</h2>
        )}

        <button onClick={lockEvent}>🔒 Lock</button>
        <button onClick={unlockEvent}>🔓 Unlock</button>

        <ScoreSheet
          eventName={eventName}
          judgeName={activeJudge}
          eventLocked={eventLocked}
        />

        <button onClick={() => setScreen("judge")}>Next Judge</button>
      </div>
    );
  }

  if (screen === "leader") {
    return (
      <div style={{ padding: 20 }}>
        <Leaderboard eventName={eventName} />
        <button onClick={() => setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}

