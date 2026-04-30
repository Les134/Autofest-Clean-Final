import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Leaderboard({ eventName }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scores"), (snap) => {
      const data = snap.docs.map((d) => d.data());
      setEntries(data.filter(e => e.eventName === eventName));
    });

    return () => unsub();
  }, [eventName]);

  const grouped = {};

  entries.forEach(e => {
    const key = e.carName + "_" + e.carClass;
    if (!grouped[key]) {
      grouped[key] = { ...e, total: 0 };
    }
    grouped[key].total += e.total;
  });

  const sorted = Object.values(grouped).sort((a,b)=>b.total-a.total);

  return (
    <div>
      <h2>Leaderboard</h2>
      {sorted.map((e,i)=>(
        <div key={i}>
          #{i+1} | {e.carName} | {e.carClass} | {e.total}
        </div>
      ))}
    </div>
  );
}
