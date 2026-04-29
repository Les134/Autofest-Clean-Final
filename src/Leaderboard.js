import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function Leaderboard({ eventName }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const q = query(
      collection(db, "scores"),
      where("eventName", "==", eventName)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map((doc) => doc.data());

      const carTotals = {};

      scores.forEach((entry) => {
        // 🔑 stronger key (prevents mismatch)
        const key = `${entry.carName}-${entry.carClass}`;

        if (!carTotals[key]) {
          carTotals[key] = {
            carName: entry.carName,
            carClass: entry.carClass,
            total: 0,
            judges: new Set()
          };
        }

        // 🔒 prevent duplicate judge counting
        if (!carTotals[key].judges.has(entry.judgeName)) {
          carTotals[key].total += entry.total;
          carTotals[key].judges.add(entry.judgeName);
        }
      });

      // group by class
      const grouped = {};

      Object.values(carTotals).forEach((car) => {
        if (!grouped[car.carClass]) {
          grouped[car.carClass] = [];
        }

        grouped[car.carClass].push({
          carName: car.carName,
          total: car.total
        });
      });

      // sort each class
      Object.keys(grouped).forEach((cls) => {
        grouped[cls].sort((a, b) => b.total - a.total);
      });

      setData(grouped);
    });

    return () => unsubscribe();
  }, [eventName]);

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Leaderboard</h2>

      {Object.keys(data).map((cls) => (
        <div key={cls}>
          <h3>{cls}</h3>

          {data[cls].map((car, index) => (
            <div key={index}>
              {index + 1}. {car.carName} — {car.total}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
