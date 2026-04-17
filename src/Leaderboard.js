import React from "react";

export default function Leaderboard({ results }) {

  const sorted = [...results].sort((a,b)=>b.total-a.total);

  return (
    <div>
      <h2>Leaderboard</h2>

      {sorted.map((r,i)=>(
        <div key={i}>
          {i+1}. {r.number} / {r.name} - {r.total}
        </div>
      ))}
    </div>
  );
}
