// force deploy
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function ScoreSheet({ eventName, judgeName, eventLocked }) {
  const [carName, setCarName] = useState("");
  const [carClass, setCarClass] = useState("");
  const [gender, setGender] = useState("");

  const [scores, setScores] = useState({
    burnout: "",
    showmanship: "",
    crowd: ""
  });

  const [deductions, setDeductions] = useState({
    reversing: false,
    stopping: false,
    barrier: false,
    fire: false
  });

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const base =
      (Number(scores.burnout) || 0) +
      (Number(scores.showmanship) || 0) +
      (Number(scores.crowd) || 0);

    const deductionCount = Object.values(deductions).filter(d => d).length;
    const deductionTotal = deductionCount * 10;

    setTotal(base - deductionTotal);
  }, [scores, deductions]);

  const handleSubmit = async () => {
    if (eventLocked) return alert("Event locked");

    if (!carName.trim()) return alert("Enter Car No / Rego");
    if (!gender) return alert("Select gender");
    if (!carClass) return alert("Select class");

    const q = query(
      collection(db, "scores"),
      where("eventName", "==", eventName),
      where("carName", "==", carName),
      where("judgeName", "==", judgeName)
    );

    const existing = await getDocs(q);

    if (!existing.empty) return alert("Already scored");

    await addDoc(collection(db, "scores"), {
      eventName,
      judgeName,
      carName,
      carClass,
      gender,
      total,
      scores,
      deductions,
      createdAt: new Date()
    });

    setCarName("");
    setCarClass("");
    setGender("");
    setScores({ burnout: "", showmanship: "", crowd: "" });
    setDeductions({
      reversing: false,
      stopping: false,
      barrier: false,
      fire: false
    });
  };

  const btn = { margin: 5, padding: 10 };
  const active = { ...btn, background: "red", color: "#fff" };

  return (
    <div>

      <input
        style={{ fontSize: 26, width: "100%" }}
        placeholder="Car No / Rego"
        value={carName}
        onChange={(e) => setCarName(e.target.value.toUpperCase())}
      />

      <div>
        <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {["Pro","Street"].map(c=>(
          <button key={c} style={carClass===c?active:btn} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {!carName || !gender || !carClass ? (
        <p>Select required fields</p>
      ) : (
        <>
          {["burnout","showmanship","crowd"].map(cat=>(
            <div key={cat}>
              {Array.from({length:21},(_,i)=>(
                <button key={i} style={scores[cat]===i?active:btn}
                  onClick={()=>setScores({...scores,[cat]:i})}>
                  {i}
                </button>
              ))}
            </div>
          ))}

          <div>
            {Object.keys(deductions).map(d=>(
              <button key={d} style={deductions[d]?active:btn}
                onClick={()=>setDeductions({...deductions,[d]:!deductions[d]})}>
                {d}
              </button>
            ))}
          </div>

          <h2>Total: {total}</h2>

          <button onClick={handleSubmit}>Submit</button>
        </>
      )}
    </div>
  );
}
