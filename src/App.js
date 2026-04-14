import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  getDocs,
  deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ADMIN_PIN = "1234";
const DELETE_PASSWORD = "delete123";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = [
  "V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"
];

const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [screen,setScreen] = useState("home");
  const [entries,setEntries] = useState([]);

  const [eventName,setEventName] = useState("");
  const [eventActive,setEventActive] = useState(false);
  const [locked,setLocked] = useState(false);

  const [judges,setJudges] = useState(["","","","","",""]);
  const [activeJudge,setActiveJudge] = useState("");

  const [car,setCar] = useState("");
  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const [saving,setSaving] = useState(false);

  // 🔥 LIVE SYNC
  useEffect(()=>{
    if(!eventName) return;

    const unsub = onSnapshot(collection(db,"scores"),(snap)=>{
      const data = snap.docs.map(d=>d.data())
        .filter(e=>e.eventName===eventName);
      setEntries(data);
    });

    return ()=>unsub();
  },[eventName]);

  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add judges");

    setJudges(valid);
    setEventActive(true);
    setScreen("judgeSelect");
  };

  // 🔥 SUBMIT FIXED
  const submit = async ()=>{
    if(saving || locked) return;

    if(!car && !gender && !carClass){
      alert("Enter car / class / gender");
      return;
    }

    setSaving(true);

    const base = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = base + tyreScore - deductionTotal;

    await addDoc(collection(db,"scores"),{
      eventName,
      judge: activeJudge,
      car,
      gender,
      carClass,
      finalScore,
      time: Date.now()
    });

    // RESET CLEAN
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");

    setSaving(false);
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);

  const big = {padding:18,margin:10,width:"100%"};

  // HOME
  if(screen==="home"){
    return (
      <div style={{padding:20}}>
        <h1>{eventName || "AutoFest System"}</h1>

        <button style={big} onClick={()=>setScreen("setup")}>New Event</button>

        {eventActive && (
          <>
            <button style={big} onClick={()=>setScreen("judgeSelect")}>Judge Login</button>
            <button style={big} onClick={()=>setScreen("score")}>Resume Judging</button>
            <button style={big} onClick={()=>setScreen("leader")}>Leaderboard</button>
          </>
        )}
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
    return (
      <div style={{padding:20}}>
        <h2>Setup Event</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={(e)=>setEventName(e.target.value)}
        />

        {judges.map((j,i)=>(
          <input key={i}
            placeholder={`Judge ${i+1}`}
            value={j}
            onChange={(e)=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button style={big} onClick={startEvent}>Start</button>
      </div>
    );
  }

  // JUDGE SELECT
  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        {judges.map((j,i)=>(
          <button key={i} style={big} onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // 🟢 SCOREBOARD FIXED
  if(screen==="score"){
    const row={marginBottom:30};
    const btn={padding:14,margin:6};
    const active={...btn,background:"red",color:"#fff"};

    return (
      <div style={{padding:20}}>
        <h3>{activeJudge}</h3>

        <input
          value={car}
          onChange={(e)=>setCar(e.target.value)}
          placeholder="Entrant No"
        />

        {/* GENDER */}
        <div style={row}>
          <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
          <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
        </div>

        {/* CLASS */}
        <div style={row}>
          {classes.map(c=>(
            <button key={c}
              style={carClass===c?{...active,background:"green"}:btn}
              onClick={()=>setCarClass(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* SCORES */}
        {categories.map(cat=>(
          <div key={cat} style={row}>
            <strong>{cat}</strong><br/>
            {Array.from({length:21},(_,i)=>(
              <button key={i}
                style={scores[cat]===i?active:btn}
                onClick={()=>setScores({...scores,[cat]:i})}>
                {i}
              </button>
            ))}
          </div>
        ))}

        {/* TYRES */}
        <div style={row}>
          <strong>Blown Tyres (+5)</strong><br/>
          <button style={tyres.left?active:btn}
            onClick={()=>setTyres({...tyres,left:!tyres.left})}>
            Left
          </button>
          <button style={tyres.right?active:btn}
            onClick={()=>setTyres({...tyres,right:!tyres.right})}>
            Right
          </button>
        </div>

        {/* DEDUCTIONS */}
        <div style={row}>
          <strong>Deductions (-10)</strong><br/>
          {deductionsList.map(d=>(
            <button key={d}
              style={deductions[d]?active:btn}
              onClick={()=>setDeductions({...deductions,[d]:!deductions[d]})}>
              {d}
            </button>
          ))}
        </div>

        <button style={big} onClick={submit}>
          {saving ? "Saving..." : "Submit & Next"}
        </button>

        <button style={big} onClick={()=>setScreen("home")}>
          Home
        </button>
      </div>
    );
  }

  // LEADERBOARD
  if(screen==="leader"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>
        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} | Car {e.car} | {e.gender} | {e.finalScore}
          </div>
        ))}
      </div>
    );
  }

  return <div>Loading...</div>;
}
