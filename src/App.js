import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = [
  "V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"
];

export default function App(){

  const [screen,setScreen] = useState("home");
  const [entries,setEntries] = useState([]);
  const [eventLocked,setEventLocked] = useState(false);

  const [eventName,setEventName] = useState("");
  const [judges,setJudges] = useState(["","","","","",""]);
  const [activeJudge,setActiveJudge] = useState("");

  const [car,setCar] = useState("");
  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");
  const [scores,setScores] = useState({});

  // 🔥 LIVE DATA
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"scores"), snap=>{
      setEntries(snap.docs.map(doc=>doc.data()) || []);
    });
    return ()=>unsub();
  },[]);

  // 🔒 LOCK STATE
  useEffect(()=>{
    const fetchLock = async ()=>{
      const snap = await getDoc(doc(db,"settings","event"));
      if(snap.exists()) setEventLocked(snap.data().locked);
    };
    fetchLock();
  },[]);

  const submit = async ()=>{
    if(eventLocked) return alert("Event Locked");

    if(!car || !gender || !carClass) return alert("Complete fields");

    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    await addDoc(collection(db,"scores"),{
      car,
      gender,
      carClass,
      finalScore: total,
      judge: activeJudge
    });

    setScores({});
    setCar("");
    setGender("");
    setCarClass("");
  };

  const lockEvent = async ()=>{
    await setDoc(doc(db,"settings","event"),{locked:true});
    setEventLocked(true);
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);

  const top30 = sorted.slice(0,30);

  const big={padding:20,fontSize:18,width:"100%",margin:10};

  // 🏠 HOME
  if(screen==="home"){
    return(
      <div style={{padding:20,textAlign:"center"}}>
        <h1>🔥 AUTOFEST 🔥</h1>

        <button style={big} onClick={()=>setScreen("setup")}>Start Event</button>
        <button style={big} onClick={()=>setScreen("leader")}>Leaderboard</button>
        <button style={big} onClick={()=>setScreen("classes")}>Class Leaderboards</button>
        <button style={big} onClick={()=>setScreen("display")}>Big Screen Mode</button>
        <button style={big} onClick={()=>setScreen("top30")}>Top 30 Shootout</button>
      </div>
    );
  }

  // 📺 BIG SCREEN
  if(screen==="display"){
    return(
      <div style={{padding:20,fontSize:24}}>
        <h1>{eventName}</h1>
        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} Car {e.car} - {e.finalScore}
          </div>
        ))}
      </div>
    );
  }

  // 🏆 TOP 30
  if(screen==="top30"){
    return(
      <div style={{padding:20}}>
        <h2>Top 30 Shootout</h2>

        {top30.map((e,i)=>(
          <div key={i}>
            #{i+1} | Car {e.car} | {e.gender} - {e.finalScore}
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // 🏁 LEADERBOARD (UNCHANGED STYLE)
  if(screen==="leader"){
    return(
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>

        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} | Car {e.car} | {e.gender} - {e.finalScore}
          </div>
        ))}

        <button onClick={lockEvent}>🔒 Lock Event</button>
        <button onClick={()=>window.print()}>🖨 Print</button>
        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // 🏎 CLASS LEADERBOARDS
  if(screen==="classes"){
    return(
      <div style={{padding:20}}>
        <h2>Class Leaderboards</h2>

        {classes.map(c=>(
          <div key={c}>
            <h3>{c}</h3>
            {sorted
              .filter(e=>e.carClass===c)
              .map((e,i)=>(
                <div key={i}>
                  #{i+1} | Car {e.car} | {e.gender} - {e.finalScore}
                </div>
              ))
            }
          </div>
        ))}

        <button onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // ⚙️ SETUP
  if(screen==="setup"){
    return(
      <div style={{padding:20}}>
        <input placeholder="Event Name" onChange={e=>setEventName(e.target.value)}/>

        {judges.map((j,i)=>(
          <input key={i} placeholder={`Judge ${i+1}`}
            onChange={e=>{
              const c=[...judges];
              c[i]=e.target.value;
              setJudges(c);
            }}
          />
        ))}

        <button onClick={()=>setScreen("judge")}>Start</button>
      </div>
    );
  }

  // 👨‍⚖️ JUDGE SELECT
  if(screen==="judge"){
    return(
      <div style={{padding:20}}>
        {judges.map((j,i)=>(
          <button key={i} style={big}
            onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // 📝 SCORING
  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{activeJudge}</h3>

        <input value={car} onChange={e=>setCar(e.target.value)} placeholder="Car"/>

        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>

        {classes.map(c=>(
          <button key={c} onClick={()=>setCarClass(c)}>{c}</button>
        ))}

        {categories.map(cat=>(
          <div key={cat}>
            <strong>{cat}</strong><br/>
            {Array.from({length:21},(_,i)=>(
              <button key={i}
                onClick={()=>setScores({...scores,[cat]:i})}>
                {i}
              </button>
            ))}
          </div>
        ))}

        <button onClick={submit}>Submit</button>
      </div>
    );
  }

  return null;
}
