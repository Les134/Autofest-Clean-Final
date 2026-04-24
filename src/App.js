import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB5NhDJMBwhMpUUL3XIHUnISTuCeQkXKS8",
  authDomain: "autofest-burnout-judging-848fd.firebaseapp.com",
  projectId: "autofest-burnout-judging-848fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const categories = ["Smoke","Commitment","Style","Control","Entertainment"];

export default function App(){

  const [screen,setScreen] = useState("home");

  // EVENT
  const [eventName,setEventName] = useState("");
  const [eventId,setEventId] = useState("");
  const [locked,setLocked] = useState(false);

  // JUDGES
  const [judges,setJudges] = useState(["","","","","",""]);
  const [judge,setJudge] = useState("");

  // DATA
  const [data,setData] = useState([]);

  // SCORE INPUT
  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [scores,setScores] = useState({});

  // 🔥 LOAD EVENT DATA ONLY
  useEffect(()=>{
    if(!eventId) return;

    const unsub = onSnapshot(collection(db,"scores_"+eventId), snap=>{
      setData(snap.docs.map(d=>d.data()));
    });

    return ()=>unsub();
  },[eventId]);

  function lockEvent(){

    if(!eventName) return alert("Enter event name");

    const id = Date.now().toString();

    setEventId(id);
    setLocked(true);
    setScreen("judgeLogin");

    // CLEAR OLD DATA
    setData([]);
  }

  function setScore(cat,val){
    setScores(prev => ({...prev,[cat]:val}));
  }

  function total(){
    return Object.values(scores).reduce((a,b)=>a+b,0);
  }

  function submit(){

    if(Object.keys(scores).length < categories.length){
      alert("Complete scoring");
      return;
    }

    addDoc(collection(db,"scores_"+eventId),{
      car,
      driver,
      total: total(),
      judge
    });

    // CLEAR ENTRY
    setScores({});
    setCar("");
    setDriver("");
  }

  function leaderboard(){
    return [...data].sort((a,b)=>b.total-a.total);
  }

  function clearPractice(){
    setScores({});
    setCar("");
    setDriver("");
  }

  // ---------------- HOME ----------------

  if(screen==="home"){
    return (
      <div style={homeWrap}>

        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={menuBtn} onClick={()=>setScreen("eventSetup")}>New Event</button>
        <button style={menuBtn} onClick={()=>setScreen("judgeLogin")}>Judge Login</button>
        <button style={menuBtn} onClick={()=>setScreen("score")}>Resume Judging</button>
        <button style={menuBtn} onClick={()=>setScreen("practice")}>Practice Mode</button>
        <button style={menuBtn} onClick={()=>setScreen("board")}>Leaderboard</button>

      </div>
    );
  }

  // ---------------- EVENT SETUP ----------------

  if(screen==="eventSetup"){
    return (
      <div style={{padding:20}}>

        <h2>Setup Event</h2>

        <input placeholder="Event Name"
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

        <button onClick={lockEvent}>Lock Event</button>
        <button onClick={()=>setScreen("home")}>Back</button>

      </div>
    );
  }

  // ---------------- JUDGE LOGIN ----------------

  if(screen==="judgeLogin"){
    return (
      <div style={homeWrap}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={menuBtn}
            onClick={()=>{
              setJudge(j || ("Judge "+(i+1)));
              setScreen("score");
            }}>
            {j || ("Judge "+(i+1))}
          </button>
        ))}

        <button onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // ---------------- LEADERBOARD ----------------

  if(screen==="board"){
    return (
      <div style={{padding:20}}>
        <h2>{eventName} Leaderboard</h2>

        {leaderboard().map((e,i)=>(
          <div key={i}>
            #{i+1} {e.car} / {e.driver} - {e.total}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ---------------- PRACTICE ----------------

  if(screen==="practice"){
    return (
      <div style={scoreWrap}>

        <h2>PRACTICE MODE</h2>

        <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
        <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />

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

        <h3>Total: {total()}</h3>

        <button style={bigBtn} onClick={clearPractice}>Clear</button>
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>

      </div>
    );
  }

  // ---------------- SCORE ----------------

  return (
    <div style={scoreWrap}>

      <h2>{judge}</h2>

      <input style={input} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input style={input} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />

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

      <h3>Total: {total()}</h3>

      <button style={bigBtn} onClick={submit}>Submit</button>
      <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>

    </div>
  );
}

// STYLES (LOCKED — WILL NOT CHANGE AGAIN)
const homeWrap = {background:"#fff",height:"100vh",padding:20,textAlign:"center"};
const menuBtn = {width:"90%",padding:16,margin:"8px auto",display:"block",fontSize:16};
const scoreWrap = {background:"#111",color:"#fff",padding:20};
const input = {width:"95%",padding:12,margin:5};
const rowBlock = {marginBottom:15};
const row = {display:"flex",flexWrap:"wrap"};
const btn = {padding:8,margin:2,minWidth:35};
const activeBtn = {...btn,background:"red",color:"#fff"};
const bigBtn = {padding:15,margin:10};
