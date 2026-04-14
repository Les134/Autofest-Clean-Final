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
  const [archivedEvents,setArchivedEvents] = useState([]);

  const [saving,setSaving] = useState(false);

  const [eventName,setEventName] = useState("");
  const [eventActive,setEventActive] = useState(false);

  const [judges,setJudges] = useState(["","","","","",""]);
  const [activeJudge,setActiveJudge] = useState("");

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  // 🔥 CURRENT EVENT DATA ONLY
  useEffect(()=>{
    if(!eventName){
      setEntries([]);
      return;
    }

    const unsub = onSnapshot(collection(db,"scores"),(snap)=>{
      const filtered = snap.docs
        .map(doc=>doc.data())
        .filter(e => e.eventName === eventName);

      setEntries(filtered);
    });

    return ()=>unsub();
  },[eventName]);

  // 🔥 ARCHIVED EVENTS
  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"archivedEvents"),(snap)=>{
      setArchivedEvents(snap.docs.map(doc=>doc.data()));
    });
    return ()=>unsub();
  },[]);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = (d)=> setDeductions({...deductions,[d]:!deductions[d]});
  const toggleTyre = (t)=> setTyres({...tyres,[t]:!tyres[t]});

  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length < 1) return alert("Add judges");

    setJudges(valid);
    setEventActive(true);
    setScreen("judgeSelect");
  };

  const submit = async ()=>{
    if(saving) return;
    setSaving(true);

    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;
    const baseScore = Object.values(scores).reduce((a,b)=>a+b,0);

    await addDoc(collection(db,"scores"),{
      eventName,
      judge: activeJudge,
      car, driver, rego, carName,
      gender, carClass,
      finalScore: baseScore + tyreScore - deductionTotal,
      time: Date.now()
    });

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");

    setSaving(false);
  };

  const archiveEvent = async ()=>{
    if(!eventName) return;

    await addDoc(collection(db,"archivedEvents"),{
      eventName,
      results: entries,
      archivedAt: Date.now()
    });

    setEntries([]);
    setEventName("");
    setEventActive(false);
    setScreen("home");

    alert("Event Archived ✅");
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore - a.finalScore);

  const grouped = {};
  sorted.forEach(e=>{
    const key = `${e.carClass} - ${e.gender}`;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(e);
  });

  const big = {padding:18,margin:10,width:"100%",fontSize:18};
  const row = {marginBottom:25};

  const scoreBtn = {padding:14,margin:6};
  const scoreActive = {padding:14,margin:6,background:"red",color:"#fff"};

  const genderBtn = {padding:14,margin:6,background:"#1976d2",color:"#fff"};
  const genderActive = {padding:14,margin:6,background:"#0d47a1",color:"#fff"};

  const classBtn = {padding:14,margin:6,background:"#00e676"};
  const classActive = {padding:14,margin:6,background:"#00c853",color:"#fff"};

  const deductionBtn = {padding:14,margin:6,background:"#555",color:"#fff"};
  const deductionActive = {padding:14,margin:6,background:"#b71c1c",color:"#fff"};

  // 🏠 HOME
  if(screen==="home"){
    return (
      <div style={{padding:20}}>
        <h1>AutoFest System</h1>

        <button style={big} onClick={()=>setScreen("setup")}>New Event</button>

        {eventActive && (
          <>
            <button style={big} onClick={()=>setScreen("judgeSelect")}>Judge Login</button>
            <button style={big} onClick={()=>setScreen("score")}>Resume Judging</button>
            <button style={big} onClick={()=>setScreen("leader")}>Leaderboard</button>
            <button style={big} onClick={()=>setScreen("classLeader")}>Leaderboard by Class</button>
            <button style={big} onClick={()=>setScreen("eventLog")}>Event Log</button>
          </>
        )}
      </div>
    );
  }

  // EVENT LOG
  if(screen==="eventLog"){
    return (
      <div style={{padding:20}}>
        <h2>Archived Events</h2>

        {archivedEvents.map((e,i)=>(
          <div key={i} style={{marginBottom:20}}>
            <strong>{e.eventName}</strong><br/>
            <button onClick={()=>window.print()}>Print</button>
          </div>
        ))}

        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
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

        <button style={big} onClick={startEvent}>Start Event</button>
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

  // LEADERBOARD
  if(screen==="leader"){
    return (
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>

        {sorted.length === 0 && <p>No results yet</p>}

        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} | Car {e.car} | {e.carClass} | {e.gender} | {e.finalScore}
          </div>
        ))}

        <button style={big} onClick={archiveEvent}>Archive Event</button>
        <button style={big} onClick={()=>window.print()}>Print</button>
        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // CLASS LEADERBOARD
  if(screen==="classLeader"){
    return (
      <div style={{padding:20}}>
        <h2>By Class</h2>

        {Object.keys(grouped).map(group=>(
          <div key={group}>
            <h3>{group}</h3>
            {grouped[group].map((e,i)=>(
              <div key={i}>
                #{i+1} | Car {e.car} | {e.finalScore}
              </div>
            ))}
          </div>
        ))}

        <button style={big} onClick={()=>window.print()}>Print</button>
        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SCOREBOARD
  return (
    <div style={{padding:20}}>

      <h3>{eventName} | {activeJudge}</h3>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} />
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

      <div style={row}>
        <button style={gender==="Male"?genderActive:genderBtn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?genderActive:genderBtn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div style={row}>
        {classes.map(c=>(
          <button key={c} style={carClass===c?classActive:classBtn} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat} style={row}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} style={scores[cat]===i?scoreActive:scoreBtn} onClick={()=>setScore(cat,i)}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <div style={row}>
        <strong>Blown Tyres</strong><br/>
        <button style={tyres.left?scoreActive:scoreBtn} onClick={()=>toggleTyre("left")}>Left</button>
        <button style={tyres.right?scoreActive:scoreBtn} onClick={()=>toggleTyre("right")}>Right</button>
      </div>

      <div style={row}>
        <strong>Deductions</strong><br/>
        {deductionsList.map(d=>(
          <button key={d} style={deductions[d]?deductionActive:deductionBtn} onClick={()=>toggleDeduction(d)}>
            {d}
          </button>
        ))}
      </div>

      <button style={big} onClick={submit}>
        {saving ? "Saving..." : "Submit & Next"}
      </button>

      <button style={big} onClick={()=>setScreen("home")}>Home</button>

    </div>
  );
}
