import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// SCORE ROWS (RESTORED)
const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Drivers Skill & Control"
];

const classes = [
  "V8 Pro","V8 N/A","6Cyl Pro","6Cyl N/A","4Cyl / Rotary"
];

const deductionsList = ["Barrier","Reversing","Fail Off Pad","Fire"];

export default function App(){

  const [screen,setScreen] = useState("home");

  // EVENT + JUDGES
  const [eventName,setEventName] = useState("");
  const [eventId,setEventId] = useState("");
  const [judges,setJudges] = useState(["","","","","",""]);
  const [judge,setJudge] = useState("");

  // DATA
  const [data,setData] = useState([]);

  // ENTRY
  const [driver,setDriver] = useState("");
  const [carNumber,setCarNumber] = useState("");
  const [carRego,setCarRego] = useState("");
  const [carClass,setCarClass] = useState("");
  const [gender,setGender] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({one:false,two:false});

  // LOAD SCORES (PER EVENT)
  useEffect(()=>{
    if(!eventId) return;

    const unsub = onSnapshot(collection(db,"scores_"+eventId), snap=>{
      setData(snap.docs.map(d=>d.data()));
    });

    return ()=>unsub();
  },[eventId]);

  // VALIDATION
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

    Object.values(deductions).forEach(v=>{
      if(v) t -= 10;
    });

    if(tyres.one) t += 5;
    if(tyres.two) t += 5;

    return t;
  }

  function submit(){

    if(!entryValid){
      alert("Complete all fields");
      return;
    }

    const activeDeductions = Object.keys(deductions).filter(d=>deductions[d]);

    addDoc(collection(db,"scores_"+eventId),{
      driver,
      carNumber,
      carRego,
      carClass,
      gender,
      total: total(),
      deductions: activeDeductions,
      judge
    });

    setScores({});
    setDeductions({});
    setTyres({one:false,two:false});
    setDriver("");
    setCarNumber("");
    setCarRego("");
  }

  function combine(){
    const map={};

    data.forEach(e=>{
      const key = (e.carNumber || e.carRego) + "_" + e.driver;

      if(!map[key]){
        map[key]={...e,total:0,deductions:[]};
      }

      map[key].total += e.total;

      if(e.deductions){
        map[key].deductions.push(...e.deductions);
      }
    });

    return Object.values(map).sort((a,b)=>b.total-a.total);
  }

  const combined = combine();

  function format(e){
    return `${e.driver} / Car Number: ${e.carNumber || e.carRego} - Score: ${e.total} [${e.carClass} - ${e.gender}]`;
  }

  // ---------------- HOME ----------------

  if(screen==="home"){
    return (
      <div style={homeWrap}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={menuBtn} onClick={()=>setScreen("event")}>New Event</button>
        <button style={menuBtn} onClick={()=>setScreen("eventLogin")}>Judge Login</button>
        <button style={menuBtn} onClick={()=>setScreen("leaderboard")}>Leaderboard</button>
      </div>
    );
  }

  // ---------------- EVENT SETUP ----------------

  if(screen==="event"){
    return (
      <div style={{padding:20}}>
        <h2>Create Event</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={e=>setEventName(e.target.value)}
        />

        {judges.map((j,i)=>(
          <input key={i}
            placeholder={"Judge "+(i+1)}
            value={judges[i]}
            onChange={e=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button onClick={()=>{
          const id = Date.now().toString();
          setEventId(id);

          setDoc(doc(db,"events",id),{
            name:eventName,
            judges
          });

          setScreen("judge");
        }}>
          Start Event
        </button>
      </div>
    );
  }

  // ---------------- EVENT LOGIN ----------------

  if(screen==="eventLogin"){
    return (
      <div style={homeWrap}>
        <h2>Select Event</h2>

        <button onClick={()=>setScreen("judge")}>Use Current Event</button>

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ---------------- JUDGE LOGIN ----------------

  if(screen==="judge"){
    return (
      <div style={homeWrap}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={menuBtn}
            onClick={()=>{setJudge(j || ("Judge "+(i+1))); setScreen("score");}}>
            {j || ("Judge "+(i+1))}
          </button>
        ))}
      </div>
    );
  }

  // ---------------- LEADERBOARD ----------------

  if(screen==="leaderboard"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>

        {combined.map((e,i)=>(
          <div key={i}>
            #{i+1} {format(e)}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ---------------- SCORE SHEET (RESTORED STYLE) ----------------

  return (
    <div style={scoreWrap}>

      <h2>{judge}</h2>

      <input style={input} placeholder="Driver Name" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input style={input} placeholder="Car Number" value={carNumber} onChange={e=>setCarNumber(e.target.value)} />
      <input style={input} placeholder="Car Rego / Number" value={carRego} onChange={e=>setCarRego(e.target.value)} />

      {/* CLASS */}
      <div>
        {classes.map(c=>(
          <button key={c}
            onClick={()=>setCarClass(c)}
            style={carClass===c?activeBtn:bigBtn}>
            {c}
          </button>
        ))}
      </div>

      {/* GENDER */}
      <div>
        <button onClick={()=>setGender("Male")} style={gender==="Male"?activeBtn:bigBtn}>Male</button>
        <button onClick={()=>setGender("Female")} style={gender==="Female"?activeBtn:bigBtn}>Female</button>
      </div>

      {categories.map(cat=>(
        <div key={cat} style={rowBlock}>
          <strong>{cat}</strong>
          <div style={row}>
            {Array.from({length:21},(_,i)=>(
              <button key={i}
                onClick={()=>setScore(cat,i)}
                style={scores[cat]===i?activeBtn:btn}>
                {i}
              </button>
            ))}
          </div>
        </div>
      ))}

      <h2>Total: {total()}</h2>

      <button style={submitBtn} onClick={submit}>SUBMIT</button>
      <button style={submitBtn} onClick={()=>setScreen("home")}>HOME</button>

    </div>
  );
}

// STYLES
const homeWrap = {background:"#fff",height:"100vh",padding:20,textAlign:"center"};
const menuBtn = {width:"90%",padding:18,margin:"8px auto",fontSize:18};

const scoreWrap = {background:"#111",color:"#fff",padding:20};
const input = {width:"95%",padding:14,margin:5};

const rowBlock = {marginBottom:20};
const row = {display:"flex",flexWrap:"wrap"};

const btn = {padding:12,margin:3,minWidth:45};
const bigBtn = {padding:14,margin:6};

const activeBtn = {...btn,background:"red",color:"#fff"};
const submitBtn = {padding:18,margin:10};
