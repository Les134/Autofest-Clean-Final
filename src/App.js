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
  const [saving,setSaving] = useState(false);

  const [eventName,setEventName] = useState("");
  const [judgeName,setJudgeName] = useState("");
  const [judgeLocked,setJudgeLocked] = useState(false);

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  useEffect(()=>{
    const unsub = onSnapshot(collection(db,"scores"),(snap)=>{
      setEntries(snap.docs.map(doc=>doc.data()));
    });
    return ()=>unsub();
  },[]);

  const setScore = (cat,val)=> setScores({...scores,[cat]:val});
  const toggleDeduction = (d)=> setDeductions({...deductions,[d]:!deductions[d]});
  const toggleTyre = (t)=> setTyres({...tyres,[t]:!tyres[t]});

  const lockJudge = ()=>{
    if(!eventName || !judgeName){
      alert("Enter event + judge name");
      return;
    }
    setJudgeLocked(true);
    setScreen("score");
  };

  const submit = async ()=>{
    if(saving) return;
    setSaving(true);

    if(!car && !driver && !rego && !carName){
      alert("Enter competitor");
      setSaving(false);
      return;
    }

    if(Object.keys(scores).length === 0){
      alert("Add scores");
      setSaving(false);
      return;
    }

    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;
    const baseScore = Object.values(scores).reduce((a,b)=>a+b,0);

    const finalScore = baseScore + tyreScore - deductionTotal;

    await addDoc(collection(db,"scores"),{
      eventName,
      judgeName,
      car, driver, rego, carName,
      gender, carClass,
      finalScore,
      time: Date.now()
    });

    // RESET CLEAN
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");

    setSaving(false);
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore - a.finalScore);
  const top150 = sorted.slice(0,150);
  const top30 = sorted.slice(0,30);

  // 🎨 STYLES
  const green = {background:"#00e676",padding:14,margin:6};
  const greenActive = {background:"#00c853",color:"#fff",padding:14,margin:6};

  const bigBtn = {padding:18,margin:10,width:"100%",fontSize:18,background:"#000",color:"#fff"};

  // HOME
  if(screen==="home"){
    return (
      <div style={{padding:20,textAlign:"center"}}>
        <h1>AutoFest Judging</h1>

        <button style={bigBtn} onClick={()=>setScreen("setup")}>Start Judging</button>
        <button style={bigBtn} onClick={()=>setScreen("top150")}>Top 150</button>
        <button style={bigBtn} onClick={()=>setScreen("top30")}>Top 30</button>
        <button style={bigBtn} onClick={()=>setScreen("leader")}>Leaderboard</button>
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
    return (
      <div style={{padding:20}}>
        <h2>Event Setup</h2>

        <input placeholder="Event Name" value={eventName} onChange={e=>setEventName(e.target.value)} disabled={judgeLocked}/>
        <input placeholder="Judge Name" value={judgeName} onChange={e=>setJudgeName(e.target.value)} disabled={judgeLocked}/>

        {!judgeLocked && <button style={bigBtn} onClick={lockJudge}>Start</button>}
      </div>
    );
  }

  // TOP 150
  if(screen==="top150"){
    return (
      <div style={{padding:20}}>
        <h2>Top 150</h2>
        {top150.map((e,i)=>(
          <div key={i}>#{i+1} | Car {e.car} | {e.carClass} | {e.gender} | {e.finalScore}</div>
        ))}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // TOP 30
  if(screen==="top30"){
    return (
      <div style={{padding:20}}>
        <h2>Top 30 Finals</h2>
        {top30.map((e,i)=>(
          <div key={i}>#{i+1} | Car {e.car} | {e.finalScore}</div>
        ))}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
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
            #{i+1} | Car {e.car} | {e.carClass} | {e.gender} | {e.finalScore} pts
          </div>
        ))}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SCORING
  return (
    <div style={{padding:20}}>

      <h3>{eventName} | {judgeName}</h3>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} />
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

      <div>
        <button onClick={()=>setGender("Male")}>Male</button>
        <button onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div>
        {classes.map(c=>(
          <button key={c} style={carClass===c?greenActive:green} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} onClick={()=>setScore(cat,i)}>{i}</button>
          ))}
        </div>
      ))}

      <button style={bigBtn} onClick={submit}>
        {saving ? "Saving..." : "Submit & Next"}
      </button>

      <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>

    </div>
  );
}
