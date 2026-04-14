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
  const [archive,setArchive] = useState([]);

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

  // 🔥 LIVE DATA
  useEffect(()=>{
    if(!eventName){
      setEntries([]);
      return;
    }

    const unsub = onSnapshot(collection(db,"scores"),(snap)=>{
      const data = snap.docs.map(d=>({id:d.id,...d.data()}))
        .filter(e=>e.eventName===eventName);
      setEntries(data);
    });

    return ()=>unsub();
  },[eventName]);

  // 🔥 ARCHIVE LOAD
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"archive"),(snap)=>{
      setArchive(snap.docs.map(d=>d.data()));
    });
    return ()=>unsub();
  },[]);

  // START EVENT
  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);
    setEventActive(true);
    setLocked(false);
    setScreen("judgeSelect");
  };

  // SUBMIT
  const submit = async ()=>{
    if(saving || locked) return;

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

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");

    setSaving(false);
  };

  // ARCHIVE EVENT
  const archiveEvent = async ()=>{
    if(!window.confirm("Archive event?")) return;

    const snap = await getDocs(collection(db,"scores"));
    const eventData = snap.docs
      .map(d=>d.data())
      .filter(e=>e.eventName===eventName);

    await addDoc(collection(db,"archive"),{
      eventName,
      data:eventData,
      date:new Date().toLocaleString()
    });

    alert("Archived");
  };

  // DELETE EVENT
  const deleteEvent = async ()=>{
    const pass = prompt("Delete password");
    if(pass !== DELETE_PASSWORD) return alert("Wrong password");

    const snap = await getDocs(collection(db,"scores"));

    await Promise.all(
      snap.docs
        .filter(doc=>doc.data().eventName===eventName)
        .map(doc=>deleteDoc(doc.ref))
    );

    alert("Deleted");
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);
  const top150 = sorted.slice(0,150);
  const top30 = top150.slice(0,30);

  const grouped = {};
  sorted.forEach(e=>{
    if(!grouped[e.carClass]) grouped[e.carClass]=[];
    grouped[e.carClass].push(e);
  });

  const femaleOverall = sorted.filter(e=>e.gender==="Female");

  const big = {padding:18,margin:10,width:"100%"};

  const renderList = (list)=>list.map((e,i)=>(
    <div key={i}>
      #{i+1} | Entrant {e.car} | {e.gender} | Score {e.finalScore}
    </div>
  ));

  // HOME
  if(screen==="home"){
    return (
      <div style={{padding:20}}>
        <h1>{eventName || "AutoFest System"}</h1>

        <button style={big} onClick={()=>setScreen("setup")}>New Event</button>
        <button style={big} onClick={()=>setScreen("archive")}>Archive</button>

        <button style={big} onClick={()=>{
          const pin = prompt("Admin PIN");
          if(pin===ADMIN_PIN) setScreen("admin");
        }}>
          Admin
        </button>

        {eventActive && (
          <>
            <button style={big} onClick={()=>setScreen("judgeSelect")}>Judge Login</button>
            <button style={big} onClick={()=>setScreen("score")}>Resume Judging</button>
            <button style={big} onClick={()=>setScreen("leader")}>Leaderboard</button>
            <button style={big} onClick={()=>setScreen("class")}>Class Leaderboard</button>
            <button style={big} onClick={()=>setScreen("female")}>Female Overall</button>
            <button style={big} onClick={()=>setScreen("top150")}>Top 150</button>
            <button style={big} onClick={()=>setScreen("top30")}>Top 30</button>
          </>
        )}
      </div>
    );
  }

  // SETUP (FIXED)
  if(screen==="setup"){
    return (
      <div style={{padding:20}}>
        <h2>Event Setup</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={(e)=>setEventName(e.target.value)}
          style={{padding:10,width:"100%",marginBottom:20}}
        />

        <h3>Judges</h3>

        {judges.map((j,i)=>(
          <input
            key={i}
            placeholder={`Judge ${i+1}`}
            value={j}
            onChange={(e)=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
            style={{padding:10,width:"100%",marginBottom:10}}
          />
        ))}

        <button style={big} onClick={startEvent}>Start Event</button>
        <button style={big} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // ADMIN
  if(screen==="admin"){
    return (
      <div style={{padding:20}}>
        <h2>Admin</h2>
        <button style={big} onClick={archiveEvent}>Archive Event</button>
        <button style={big} onClick={deleteEvent}>Delete Event</button>
        <button style={big} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // ARCHIVE
  if(screen==="archive"){
    return (
      <div style={{padding:20}}>
        <h2>Archived Events</h2>

        {archive.map((a,i)=>(
          <div key={i}>
            <strong>{a.eventName}</strong> - {a.date}
          </div>
        ))}

        <button style={big} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // JUDGE SELECT
  if(screen==="judgeSelect"){
    return (
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={big} onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}

        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SCOREBOARD
  if(screen==="score"){
    const btn={padding:12,margin:5};
    const active={...btn,background:"red",color:"#fff"};

    return (
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        <input value={car} onChange={(e)=>setCar(e.target.value)} placeholder="Entrant"/>

        {categories.map(cat=>(
          <div key={cat}>
            {cat}<br/>
            {Array.from({length:21},(_,i)=>(
              <button key={i}
                style={scores[cat]===i?active:btn}
                onClick={()=>setScores({...scores,[cat]:i})}>{i}</button>
            ))}
          </div>
        ))}

        <button style={big} onClick={submit}>{saving?"Saving...":"Submit & Next"}</button>
      </div>
    );
  }

  // LEADERBOARDS
  if(screen==="leader") return <div style={{padding:20}}>{renderList(sorted)}</div>;
  if(screen==="top150") return <div style={{padding:20}}>{renderList(top150)}</div>;
  if(screen==="top30") return <div style={{padding:20}}>{renderList(top30)}</div>;
  if(screen==="female") return <div style={{padding:20}}>{renderList(femaleOverall)}</div>;

  if(screen==="class"){
    return <div style={{padding:20}}>
      {Object.keys(grouped).map(k=>(
        <div key={k}>
          <h3>{k}</h3>
          {renderList(grouped[k])}
        </div>
      ))}
    </div>;
  }

  return <div>Loading...</div>;
}
