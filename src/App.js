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
  const [judge,setJudge] = useState("");
  const [data,setData] = useState([]);

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [scores,setScores] = useState({});

  // LIVE DATA
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"scores"), snap=>{
      setData(snap.docs.map(d=>d.data()));
    });
    return ()=>unsub();
  },[]);

  function setScore(cat,val){
    setScores(prev => ({...prev,[cat]:val}));
  }

  function total(){
    return Object.values(scores).reduce((a,b)=>a+b,0);
  }

  function submit(){
    addDoc(collection(db,"scores"),{
      car,
      driver,
      total: total(),
      judge
    });

    setScores({});
    setCar("");
    setDriver("");
  }

  function leaderboard(){
    return [...data].sort((a,b)=>b.total-a.total);
  }

  // ---------------- HOME ----------------

  if(screen==="home"){
    return (
      <div style={homeWrap}>

        <h1 style={title}>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={menuBtn} onClick={()=>setScreen("newEvent")}>New Event</button>
        <button style={menuBtn} onClick={()=>setScreen("judgeLogin")}>Judge Login</button>
        <button style={menuBtn} onClick={()=>setScreen("score")}>Resume Judging</button>
        <button style={menuBtn} onClick={()=>setScreen("score")}>Return to Score Sheet</button>
        <button style={menuBtn} onClick={()=>setScreen("board")}>Leaderboard</button>
        <button style={menuBtn} onClick={()=>setScreen("top150")}>Top 150</button>
        <button style={menuBtn} onClick={()=>setScreen("top30")}>Top 30</button>

      </div>
    );
  }

  // ---------------- JUDGE LOGIN ----------------

  if(screen==="judgeLogin"){
    return (
      <div style={homeWrap}>
        <h2>Select Judge</h2>

        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={menuBtn} onClick={()=>{
            setJudge("Judge "+j);
            setScreen("score");
          }}>
            Judge {j}
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
        <h2>Leaderboard</h2>

        {leaderboard().map((e,i)=>(
          <div key={i}>
            #{i+1} {e.car} / {e.driver} - {e.total}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ---------------- TOP 150 ----------------

  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>Top 150</h2>

        {leaderboard().slice(0,150).map((e,i)=>(
          <div key={i}>
            #{i+1} {e.car} / {e.driver} - {e.total}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ---------------- TOP 30 ----------------

  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>Top 30</h2>

        {leaderboard().slice(0,30).map((e,i)=>(
          <div key={i}>
            #{i+1} {e.car} / {e.driver} - {e.total}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
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
              <button
                key={i}
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

// STYLES
const homeWrap = {
  background:"#fff",
  height:"100vh",
  padding:20,
  textAlign:"center"
};

const title = {
  marginBottom:30
};

const menuBtn = {
  width:"90%",
  padding:15,
  margin:"8px auto",
  display:"block",
  fontSize:16
};

const scoreWrap = {
  background:"#111",
  color:"#fff",
  padding:20
};

const input = {
  width:"95%",
  padding:12,
  margin:5
};

const rowBlock = {marginBottom:15};

const row = {
  display:"flex",
  flexWrap:"wrap"
};

const btn = {
  padding:8,
  margin:2
};

const activeBtn = {
  ...btn,
  background:"red",
  color:"#fff"
};

const bigBtn = {
  padding:15,
  margin:10
};
