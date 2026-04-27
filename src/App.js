import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
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

  const [eventName,setEventName] = useState("");
  const [eventId,setEventId] = useState("");
  const [events,setEvents] = useState([]);

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

  const [adminPass,setAdminPass] = useState(localStorage.getItem("adminPass") || "");
  const [adminLogged,setAdminLogged] = useState(false);

  function adminSetup(){
    const pass = prompt("Set Admin Password");
    if(pass){
      localStorage.setItem("adminPass",pass);
      setAdminPass(pass);
    }
  }

  function adminLogin(){
    const pass = prompt("Enter Admin Password");
    if(pass === adminPass){
      setAdminLogged(true);
    } else {
      alert("Wrong Password");
    }
  }

  useEffect(()=>{
    getDocs(collection(db,"events")).then(snap=>{
      setEvents(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
  },[]);

  useEffect(()=>{
    if(!eventId) return;

    const unsub = onSnapshot(collection(db,"scores_"+eventId), snap=>{
      setData(snap.docs.map(d=>({id:d.id,...d.data()})));
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

    Object.values(deductions).forEach(v=>{
      if(v) t -= 10;
    });

    if(tyres.one) t += 5;
    if(tyres.two) t += 5;

    return t;
  }

  function submit(){
    if(!entryValid) return alert("Complete all fields");

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
    setCarClass("");
    setGender("");
    setDriver("");
    setCarNumber("");
    setCarRego("");
  }

  function deleteScore(id){
    if(!adminLogged) return alert("Admin only");
    deleteDoc(doc(db,"scores_"+eventId,id));
  }

  function combine(){
    const map = {};

    data.forEach(e=>{
      const key = (e.carNumber || e.carRego) + "_" + e.driver;

      if(!map[key]){
        map[key] = {
          ...e,
          total: 0,
          deductions: [],
          carClass: e.carClass || "Unassigned",
          gender: e.gender || "Unassigned"
        };
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
    const ded = e.deductions?.length
      ? ` (${[...new Set(e.deductions)].join(", ")})`
      : "";

    return `${e.driver} / Car Number: ${e.carNumber || e.carRego} - Score: ${e.total}${ded} [${e.carClass} - ${e.gender}]`;
  }

  if(screen==="home"){
    return (
      <div style={homeWrap}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={menuBtn} onClick={()=>setScreen("eventLogin")}>Event and Judge Login</button>
        <button style={menuBtn} onClick={()=>setScreen("judgeSelect")}>Judge Login</button>
        <button style={menuBtn} onClick={()=>setScreen("score")}>Resume Scoring</button>

        <button style={menuBtn} onClick={()=>setScreen("leaderboard")}>Leaderboard</button>
        <button style={menuBtn} onClick={()=>setScreen("top150")}>Top 150</button>
        <button style={menuBtn} onClick={()=>setScreen("top30")}>Top 30</button>

        <button style={menuBtn} onClick={()=>setScreen("archive")}>Event Archive</button>

        <button style={menuBtn} onClick={adminSetup}>Set Admin</button>
        <button style={menuBtn} onClick={adminLogin}>Admin Login</button>
      </div>
    );
  }

  if(screen==="eventLogin"){
    return (
      <div style={{padding:20}}>
        <h2>Setup Event</h2>

        <input placeholder="Event Name" value={eventName} onChange={e=>setEventName(e.target.value)} />

        {judges.map((j,i)=>(
          <input key={i} placeholder={`Judge ${i+1}`} value={judges[i]}
            onChange={e=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        {/* ✅ FIXED LOGIN FLOW */}
        <button onClick={async ()=>{
          const id = Date.now().toString();

          await setDoc(doc(db,"events",id),{
            name:eventName,
            judges
          });

          const fresh = await getDocs(collection(db,"events"));
          const found = fresh.docs.find(d=>d.id === id);

          if(found){
            setJudges(found.data().judges || []);
          }

          setEventId(id);
          setScreen("judgeSelect");
        }}>
          Lock Event
        </button>
      </div>
    );
  }

  if(screen==="judgeSelect"){
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

  if(screen==="archive"){
    return (
      <div style={{padding:20}}>
        <h2>Event Archive</h2>

        {events.map(e=>(
          <button key={e.id}
            onClick={()=>{setEventId(e.id); setScreen("leaderboard");}}>
            {e.name}
          </button>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  if(screen==="leaderboard" || screen==="top150" || screen==="top30"){

    let list = combined;
    if(screen==="top150") list = combined.slice(0,150);
    if(screen==="top30") list = combined.slice(0,30);

    return (
      <div style={{padding:20}}>
        <h2>{screen.toUpperCase()}</h2>

        {list.map((e,i)=>(
          <div key={i}>
            #{i+1} {format(e)}
            {adminLogged && <button onClick={()=>deleteScore(e.id)}>Delete</button>}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return (
    <div style={scoreWrap}>
      <h2>Judge: {judge}</h2>
      {/* scoring UI unchanged */}
    </div>
  );
}

const homeWrap = {background:"#fff",height:"100vh",padding:20,textAlign:"center"};
const menuBtn = {width:"90%",padding:18,margin:"8px auto",fontSize:18};

const scoreWrap = {background:"#111",color:"#fff",padding:20};
const btn = {padding:12,margin:3};
const bigBtn = {padding:14,margin:6};
const activeBtn = {...btn,background:"red",color:"#fff"};
