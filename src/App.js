import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

const categories = [
  "Instant Smoke",
  "Volume of Smoke",
  "Constant Smoke",
  "Driver Skill & Control"
];

const classes = [
  "V8 Pro",
  "V8 N/A",
  "6 Cyl Pro",
  "6 Cyl N/A",
  "4Cyl Open/Rotary"
];

const deductionsList = ["Reversing","Stopping","Barrier","Fire"];

export default function App(){

  const [screen,setScreen] = useState("home");

  const [eventName,setEventName] = useState("");
  const [judges,setJudges] = useState(["","","","","",""]);
  const [activeJudge,setActiveJudge] = useState("");

  const [events,setEvents] = useState([]);

  const [car,setCar] = useState("");
  const [name,setName] = useState("");
  const [rego,setRego] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const [saving,setSaving] = useState(false);
  const [isAdmin,setIsAdmin] = useState(false);

  // LOAD EVENTS
  useEffect(()=>{
    loadEvents();
  },[]);

  const loadEvents = async ()=>{
    const snap = await getDocs(collection(db,"events"));
    const list = snap.docs.map(d=>({id:d.id,...d.data()}));
    setEvents(list);
  };

  // CREATE EVENT
  const startEvent = async ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    await addDoc(collection(db,"events"),{
      name:eventName,
      judges:valid,
      createdAt:new Date()
    });

    loadEvents();
    setScreen("judge");
  };

  // SUBMIT SCORE
  const submit = async ()=>{
    if(saving) return;

    if(!car && !name && !rego){
      return alert("Enter Car #, Name or Rego");
    }

    setSaving(true);

    const base = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = base + tyreScore - deductionTotal;

    await addDoc(collection(db,"scores"),{
      eventName,
      car,
      name,
      rego,
      gender,
      carClass,
      judge:activeJudge,
      finalScore,
      createdAt:new Date()
    });

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setName("");
    setRego("");
    setGender("");
    setCarClass("");

    setSaving(false);
  };

  const deleteEvent = async (id)=>{
    if(!isAdmin) return alert("Admin only");

    await deleteDoc(doc(db,"events",id));
    loadEvents();
  };

  const big={padding:18,margin:10,width:"100%",fontSize:18};
  const btn={padding:12,margin:5,border:"1px solid #ccc"};
  const active={...btn,background:"red",color:"#fff"};
  const classActive={...btn,background:"green",color:"#fff"};

  // HOME
  if(screen==="home"){
    return(
      <div style={{padding:20}}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={big} onClick={()=>setScreen("setup")}>New Event</button>
        <button style={big} onClick={()=>setScreen("judge")}>Judge Login</button>
        <button style={big} onClick={()=>setScreen("score")}>Resume Scoring</button>

        <button style={big} onClick={()=>setScreen("archive")}>Event Archive</button>
        <button style={big} onClick={()=>setScreen("admin")}>Admin Login</button>
      </div>
    );
  }

  // ADMIN
  if(screen==="admin"){
    return(
      <div style={{padding:20}}>
        <h2>Admin Login</h2>

        <input type="password" placeholder="Password"
          onChange={(e)=>{
            if(e.target.value==="autofest123"){
              setIsAdmin(true);
              alert("Admin logged in");
            }
          }}
        />

        <button style={big} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
    return(
      <div style={{padding:20}}>
        <h2>Event Setup</h2>

        <input placeholder="Event Name" onChange={(e)=>setEventName(e.target.value)} />

        {judges.map((j,i)=>(
          <input key={i}
            placeholder={`Judge ${i+1}`}
            onChange={(e)=>{
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

  // JUDGE
  if(screen==="judge"){
    return(
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={big}
            onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}

        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  // SCORE
  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        <input placeholder="Car #" value={car} onChange={(e)=>setCar(e.target.value)} />
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Rego" value={rego} onChange={(e)=>setRego(e.target.value)} />

        <div>
          <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
          <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
        </div>

        <div>
          {classes.map(c=>(
            <button key={c}
              style={carClass===c?classActive:btn}
              onClick={()=>setCarClass(c)}>
              {c}
            </button>
          ))}
        </div>

        {categories.map(cat=>(
          <div key={cat}>
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

        <button style={big} onClick={submit}>
          {saving ? "Saving..." : "Submit & Next"}
        </button>
      </div>
    );
  }

  // ARCHIVE
  if(screen==="archive"){
    return(
      <div style={{padding:20}}>
        <h2>Event Archive</h2>

        {events.map(ev=>(
          <div key={ev.id}>
            {ev.name}
            {isAdmin && (
              <button onClick={()=>deleteEvent(ev.id)}>Delete</button>
            )}
          </div>
        ))}

        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}
