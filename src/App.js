import React, { useState } from "react";

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
  const [eventName,setEventName] = useState("");
  const [judges,setJudges] = useState(["","","","","",""]);
  const [activeJudge,setActiveJudge] = useState("");
  const [entries,setEntries] = useState([]);

  const [car,setCar] = useState("");
  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const bigBtn = {
    width:"100%", padding:"16px", margin:"6px 0",
    fontSize:"18px", borderRadius:"6px", border:"none"
  };

  const scoreBtn = {
    width:"36px",
    height:"36px",
    margin:"2px",
    borderRadius:"4px",
    border:"1px solid #ccc",
    fontSize:"12px"
  };

  const active = { background:"red", color:"#fff" };
  const classActive = { background:"green", color:"#fff" };

  // RESET
  const fullReset = ()=>{
    if(!window.confirm("Start new event? EVERYTHING will be cleared")) return;
    setEntries([]);
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");
    setActiveJudge("");
    setEventName("");
    setJudges(["","","","","",""]);
    setScreen("home");
  };

  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);
    setScreen("judge");
  };

  const submit = ()=>{
    if(!car || !gender || !carClass){
      return alert("Complete all fields");
    }

    const base = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = base + tyreScore - deductionTotal;

    const entry = { car, gender, carClass, finalScore };

    setEntries(prev => [...prev, entry]);

    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);

  const renderList = (list)=>list.map((e,i)=>(
    <div key={i} style={{
      padding:"10px",
      marginBottom:"6px",
      background:i===0?"#ff3c00":"#1a1a1a",
      color:"#fff"
    }}>
      #{i+1} | Car {e.car} | {e.gender} | {e.carClass} | Score {e.finalScore}
    </div>
  ));

  // HOME
  if(screen==="home"){
    return(
      <div style={{padding:20}}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={bigBtn} onClick={()=>setScreen("setup")}>New Event</button>
        <button style={bigBtn} onClick={()=>setScreen("judge")}>Judge Login</button>

        <button style={bigBtn} onClick={()=>setScreen("leader")}>Leaderboard</button>

        <button style={bigBtn} onClick={fullReset}>FULL RESET</button>
      </div>
    );
  }

  // SETUP
  if(screen==="setup"){
    return(
      <div style={{padding:20}}>
        <h2>Event Setup</h2>

        <input style={{width:"100%",padding:10,marginBottom:10}}
          placeholder="Event Name"
          value={eventName}
          onChange={(e)=>setEventName(e.target.value)}
        />

        {judges.map((j,i)=>(
          <input key={i}
            style={{width:"100%",padding:10,marginBottom:6}}
            placeholder={`Judge ${i+1}`}
            onChange={(e)=>{
              const copy=[...judges];
              copy[i]=e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button style={bigBtn} onClick={startEvent}>Start Event</button>
        <button style={bigBtn} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // JUDGE
  if(screen==="judge"){
    return(
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={bigBtn}
            onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // SCORE (🔥 FIXED GRID)
  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        <input style={{width:"100%",padding:10}}
          value={car}
          onChange={(e)=>setCar(e.target.value)}
          placeholder="Entrant No"
        />

        <div>
          <button style={gender==="Male"?active:{}} onClick={()=>setGender("Male")}>Male</button>
          <button style={gender==="Female"?active:{}} onClick={()=>setGender("Female")}>Female</button>
        </div>

        <div>
          {classes.map(c=>(
            <button key={c}
              style={carClass===c?classActive:{}}
              onClick={()=>setCarClass(c)}>
              {c}
            </button>
          ))}
        </div>

        {categories.map(cat=>(
          <div key={cat} style={{marginBottom:10}}>
            <strong>{cat}</strong><br/>
            <div style={{display:"flex",flexWrap:"wrap"}}>
              {Array.from({length:21},(_,i)=>(
                <button key={i}
                  style={{
                    ...scoreBtn,
                    ...(scores[cat]===i?active:{})
                  }}
                  onClick={()=>setScores({...scores,[cat]:i})}>
                  {i}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <strong>Blown Tyres (+5)</strong><br/>
          <button style={tyres.left?active:{}} onClick={()=>setTyres({...tyres,left:!tyres.left})}>Left</button>
          <button style={tyres.right?active:{}} onClick={()=>setTyres({...tyres,right:!tyres.right})}>Right</button>
        </div>

        <div>
          <strong>Deductions (-10)</strong><br/>
          {deductionsList.map(d=>(
            <button key={d}
              style={deductions[d]?active:{}}
              onClick={()=>setDeductions({...deductions,[d]:!deductions[d]})}>
              {d}
            </button>
          ))}
        </div>

        <button style={bigBtn} onClick={submit}>Submit Score</button>
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  if(screen==="leader"){
    return(
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>
        {renderList(sorted)}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}
