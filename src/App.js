import React, { useState } from "react";

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

  const [entries,setEntries] = useState([]);

  const [car,setCar] = useState("");
  const [name,setName] = useState("");
  const [rego,setRego] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const [saving,setSaving] = useState(false);

  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);
    setScreen("judge");
  };

  const submit = ()=>{
    if(saving) return;

    if(!car && !name && !rego){
      return alert("Enter Car #, Name or Rego");
    }

    setSaving(true);

    const base = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = base + tyreScore - deductionTotal;

    const entry = {
      car,
      name,
      rego,
      gender,
      carClass,
      finalScore
    };

    setEntries(prev => [...prev, entry]);

    // RESET
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

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);

  const big={padding:18,margin:10,width:"100%",fontSize:18};
  const btn={padding:12,margin:5,border:"1px solid #ccc"};
  const active={...btn,background:"red",color:"#fff"};
  const classActive={...btn,background:"green",color:"#fff"};

  if(screen==="home"){
    return(
      <div style={{padding:20}}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={big} onClick={()=>setScreen("setup")}>New Event</button>
        <button style={big} onClick={()=>setScreen("judge")}>Judge Login</button>
        <button style={big} onClick={()=>setScreen("score")}>Resume Scoring</button>
        <button style={big} onClick={()=>setScreen("leader")}>Leaderboard</button>
      </div>
    );
  }

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

  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        {/* CAR DETAILS */}
        <input placeholder="Car #" value={car} onChange={(e)=>setCar(e.target.value)} />
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Rego" value={rego} onChange={(e)=>setRego(e.target.value)} />

        {/* GENDER */}
        <div style={{marginTop:20}}>
          <strong>Gender</strong><br/>
          <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
          <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
        </div>

        {/* CLASS */}
        <div style={{marginTop:20}}>
          <strong>Class</strong><br/>
          {classes.map(c=>(
            <button key={c}
              style={carClass===c?classActive:btn}
              onClick={()=>setCarClass(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* SCORING */}
        {categories.map(cat=>(
          <div key={cat} style={{marginTop:20}}>
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

        {/* TYRES */}
        <div style={{marginTop:20}}>
          <strong>Tyres Blown (+5)</strong><br/>
          <button style={tyres.left?active:btn} onClick={()=>setTyres({...tyres,left:!tyres.left})}>Left</button>
          <button style={tyres.right?active:btn} onClick={()=>setTyres({...tyres,right:!tyres.right})}>Right</button>
        </div>

        {/* DEDUCTIONS */}
        <div style={{marginTop:20}}>
          <strong>Deductions (-10)</strong><br/>
          {deductionsList.map(d=>(
            <button key={d}
              style={deductions[d]?active:btn}
              onClick={()=>setDeductions({...deductions,[d]:!deductions[d]})}>
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

  if(screen==="leader"){
    return(
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>
        {sorted.map((e,i)=>(
          <div key={i}>
            #{i+1} | {e.car || e.name || e.rego} | {e.finalScore}
          </div>
        ))}
        <button style={big} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}
