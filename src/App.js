import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Drivers Skill & Control"
];

const classes = [
  "V8 Pro",
  "V8 N/A",
  "6Cyl Pro",
  "6Cyl N/A",
  "4Cyl / Rotary",
  "Female Class"
];

const deductionsList = ["Barrier","Reversing","Fail Off Pad","Fire"];

export default function App(){

  const [screen,setScreen] = useState("home");
  const [eventName,setEventName] = useState("");
  const [eventId,setEventId] = useState("");

  const [judges,setJudges] = useState(["","","","","",""]);
  const [judge,setJudge] = useState("");

  const [data,setData] = useState([]);

  const [driver,setDriver] = useState("");
  const [carNumber,setCarNumber] = useState("");
  const [carRego,setCarRego] = useState("");

  const [carClass,setCarClass] = useState("");
  const [gender,setGender] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({one:false,two:false});

  useEffect(()=>{
    if(!eventId) return;
    const unsub = onSnapshot(collection(db,"scores_"+eventId), snap=>{
      setData(snap.docs.map(d=>d.data()));
    });
    return ()=>unsub();
  },[eventId]);

  const entryValid =
    (carNumber.trim() !== "" || carRego.trim() !== "") &&
    carClass !== "" &&
    gender !== "";

  function setScore(cat,val){
    if(!entryValid) return;
    setScores(prev=>({...prev,[cat]:val}));
  }

  function toggleDeduction(d){
    setDeductions(prev=>({...prev,[d]:!prev[d]}));
  }

  function total(){
    let t = Object.values(scores).reduce((a,b)=>a+b,0);
    Object.values(deductions).forEach(v=>{ if(v) t -= 10; });
    if(tyres.one) t += 5;
    if(tyres.two) t += 5;
    return t;
  }

  function submit(){
    if(!entryValid) return alert("Complete all fields");

    addDoc(collection(db,"scores_"+eventId),{
      driver,
      carNumber,
      carRego,
      carClass,
      gender,
      total: total(),
      deductions: Object.keys(deductions).filter(d=>deductions[d]),
      judge
    });

    setScores({});
    setDeductions({});
    setTyres({one:false,two:false});
    setCarClass("");
    setGender("");
    setDriver("");
    setCarNumber("");
    setCarRego("");
  }

  function combine(){
    const map = {};

    data.forEach(e=>{
      const key = (e.carNumber || e.carRego) + "_" + e.driver;

      if(!map[key]){
        map[key] = {...e,total:0};
      }

      map[key].total += e.total;
    });

    return Object.values(map).sort((a,b)=>b.total-a.total);
  }

  const combined = combine();

  // HOME
  if(screen==="home"){
    return (
      <div style={{padding:20}}>
        <h1>🔥 AUTOFEST 🔥</h1>
        <button onClick={()=>setScreen("eventLogin")}>Event & Judge Login</button>
        <button onClick={()=>setScreen("leaderboard")}>Leaderboard</button>
      </div>
    );
  }

  // EVENT LOGIN
  if(screen==="eventLogin"){
    return (
      <div style={{padding:20}}>
        <h2>Event Setup</h2>
        <input placeholder="Event Name" value={eventName} onChange={e=>setEventName(e.target.value)} />

        {judges.map((j,i)=>(
          <input key={i} placeholder={`Judge ${i+1}`} value={j}
            onChange={e=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button onClick={async ()=>{
          const clean = judges.filter(j=>j);
          const id = Date.now().toString();
          await setDoc(doc(db,"events",id),{name:eventName,judges:clean});
          setJudges(clean);
          setEventId(id);
          setScreen("judgeSelect");
        }}>
          Start Event
        </button>
      </div>
    );
  }

  // JUDGE SELECT
  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>
        {judges.map((j,i)=>(
          <button key={i} onClick={()=>{setJudge(j); setScreen("score");}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // LEADERBOARD
  if(screen==="leaderboard"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>
        {combined.map((e,i)=>(
          <div key={i}>
            #{i+1} {e.driver} - {e.total}
          </div>
        ))}
        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SCORE SHEET
  return (
    <div style={{padding:20}}>
      <h2>Judge: {judge}</h2>

      <input placeholder="Driver Name" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Car Number" value={carNumber} onChange={e=>setCarNumber(e.target.value)} />
      <input placeholder="Car Rego" value={carRego} onChange={e=>setCarRego(e.target.value)} />

      <div>
        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)}>{c}</button>
        ))}
      </div>

      <div>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong>
          {[...Array(21)].map((_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)}>{i}</button>
          ))}
        </div>
      ))}

      <div>
        <button onClick={()=>setTyres(p=>({...p,one:!p.one}))}>Tyre 1</button>
        <button onClick={()=>setTyres(p=>({...p,two:!p.two}))}>Tyre 2</button>
      </div>

      {deductionsList.map(d=>(
        <button key={d} onClick={()=>toggleDeduction(d)}>{d}</button>
      ))}

      <h2>Total: {total()}</h2>

      <button onClick={submit}>Submit</button>
      <button onClick={()=>setScreen("home")}>Home</button>
    </div>
  );
}
