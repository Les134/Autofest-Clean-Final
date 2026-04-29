import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function ScoreSheet({ eventName, judgeName }) {
  const [carName, setCarName] = useState("");
  const [carClass, setCarClass] = useState("");

  const [scores, setScores] = useState({
    burnout: 0,
    showmanship: 0,
    crowd: 0
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(
      Number(scores.burnout) +
      Number(scores.showmanship) +
      Number(scores.crowd)
    );
  }, [scores]);

  const handleSubmit = async () => {
    if (!carName || !carClass) return;

    // 🔒 prevent duplicate scoring per judge/car/event
    const q = query(
      collection(db, "scores"),
      where("eventName", "==", eventName),
      where("carName", "==", carName),
      where("judgeName", "==", judgeName)
    );

    const existing = await getDocs(q);

    if (!existing.empty) {
      alert("You already scored this car.");
      return;
    }

    await addDoc(collection(db, "scores"), {
      eventName,
      judgeName,
      carName,
      carClass,
      scores,
      total,
      createdAt: new Date()
    });

    // reset form
    setCarName("");
    setCarClass("");
    setScores({ burnout: 0, showmanship: 0, crowd: 0 });
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Score Car</h3>

      <input
        placeholder="Car Name"
        value={carName}
        onChange={(e) => setCarName(e.target.value)}
      />

      <input
        placeholder="Class"
        value={carClass}
        onChange={(e) => setCarClass(e.target.value)}
      />

      <div>
        Burnout:
        <input
          type="number"
          value={scores.burnout}
          onChange={(e) =>
            setScores({ ...scores, burnout: e.target.value })
          }
        />
      </div>

      <div>
        Showmanship:
        <input
          type="number"
          value={scores.showmanship}
          onChange={(e) =>
            setScores({ ...scores, showmanship: e.target.value })
          }
        />
      </div>

      <div>
        Crowd:
        <input
          type="number"
          value={scores.crowd}
          onChange={(e) =>
            setScores({ ...scores, crowd: e.target.value })
          }
        />
      </div>

      <h4>Total: {total}</h4>

      <button onClick={handleSubmit}>Submit Score</button>
    </div>
  );
}
