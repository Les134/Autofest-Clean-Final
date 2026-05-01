import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Leaderboard({ eventName }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "scores"), snap => {
      setData(snap.docs.map(d => d.data()).filter(e => e.eventName === eventName));
    });
    return () => unsub();
  }, [eventName]);

  const totals = {};

  data.forEach(e => {
    const key = e.car + e.classType;
    if (!totals[key]) totals[key] = {...e, total:0};
    totals[key].total += e.total;
  });

  const sorted = Object.values(totals).sort((a,b)=>b.total-a.total);

  return (
    <div style={{ padding: 20 }}>
      <h1>LEADERBOARD</h1>

      {sorted.map((e,i)=>(
        <div key={i} style={{ fontSize: 22, margin: 10 }}>
          #{i+1} — {e.car} — {e.total}
        </div>
      ))}
    </div>
  );
}
