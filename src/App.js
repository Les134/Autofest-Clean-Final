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
    width:"100%", padding:"18px", margin:"8px 0",
    fontSize:"18px", borderRadius:"8px", border:"none"
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

  // START EVENT
  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);
    setScreen("judge");
  };

  // SUBMIT
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

    // reset entry
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");
  };

  // SORT
  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);

  const grouped = {};
  sorted.forEach(e=>{
    if(!grouped[e.carClass]) grouped[e.carClass]=[];
    grouped[e.carClass].push(e);
  });

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

        <h3>Scoreboards</h3>
        <button style={bigBtn} onClick={()=>setScreen("leader")}>Overall Leaderboard</button>
        <button style={bigBtn} onClick={()=>setScreen("class")}>Class Leaderboard</button>
        <button style={bigBtn} onClick={()=>setScreen("female")}>Female Overall</button>

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

  // JUDGE LOGIN
  if(screen==="judge"){
    return(
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={bigBtn}
            onClick={()=>{
              setActiveJudge(j);
              setScreen("score");
            }}>
            {j}
          </button>
        ))}

        <button style={bigBtn} onClick={()=>setScreen("home")}>Back</button>
      </div>
    );
  }

  // SCORING
  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        <input style={{width:"100%",padding:12}}
          value={car}
          onChange={(e)=>setCar(e.target.value)}
          placeholder="Entrant No"
        />

        <div>
          <button style={{...bigBtn,...(gender==="Male"?active:{})}} onClick={()=>setGender("Male")}>Male</button>
          <button style={{...bigBtn,...(gender==="Female"?active:{})}} onClick={()=>setGender("Female")}>Female</button>
        </div>

        <div>
          {classes.map(c=>(
            <button key={c}
              style={{...bigBtn,...(carClass===c?classActive:{})}}
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
                style={{margin:2, ...(scores[cat]===i?active:{})}}
                onClick={()=>setScores({...scores,[cat]:i})}>
                {i}
              </button>
            ))}
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

  // LEADERBOARDS
  if(screen==="leader") return <div style={{padding:20}}><h2>Leaderboard</h2>{renderList(sorted)}<button style={bigBtn} onClick={()=>setScreen("home")}>Home</button></div>;

  if(screen==="female"){
    const female = sorted.filter(e=>e.gender==="Female");
    return <div style={{padding:20}}><h2>Female</h2>{renderList(female)}<button style={bigBtn} onClick={()=>setScreen("home")}>Home</button></div>;
  }

  if(screen==="class"){
    return(
      <div style={{padding:20}}>
        <h2>Class Leaderboard</h2>
        {Object.keys(grouped).map(k=>(
          <div key={k}>
            <h3>{k}</h3>
            {renderList(grouped[k])}
          </div>
        ))}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}
