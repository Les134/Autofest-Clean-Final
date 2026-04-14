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

  const [car,setCar] = useState("");
  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  const [saving,setSaving] = useState(false);

  // ---------- START EVENT ----------
  const startEvent = ()=>{
    const valid = judges.filter(j=>j.trim() !== "");
    if(!eventName) return alert("Enter event name");
    if(valid.length === 0) return alert("Add at least 1 judge");

    setJudges(valid);
    setScreen("judgeSelect");
  };

  // ---------- SUBMIT ----------
  const submit = ()=>{
    if(saving) return;

    if(!car){
      alert("Enter entrant number");
      return;
    }

    setSaving(true);

    const base = Object.values(scores).reduce((a,b)=>a+b,0);
    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const finalScore = base + tyreScore - deductionTotal;

    console.log({
      judge: activeJudge,
      car,
      gender,
      carClass,
      finalScore
    });

    // RESET CLEAN
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setGender("");
    setCarClass("");

    setSaving(false);
  };

  const big={padding:18,margin:10,width:"100%",fontSize:18};
  const row={marginBottom:30};
  const btn={padding:14,margin:6,borderRadius:6,border:"1px solid #ccc"};
  const active={...btn,background:"red",color:"#fff"};
  const classActive={...btn,background:"green",color:"#fff"};

  // ---------- HOME ----------
  if(screen==="home"){
    return(
      <div style={{padding:20}}>
        <h1>🏁 AUTOFEST SERIES</h1>

        <button style={big} onClick={()=>setScreen("setup")}>
          New Event
        </button>
      </div>
    );
  }

  // ---------- SETUP ----------
  if(screen==="setup"){
    return(
      <div style={{padding:20}}>
        <h2>Event Setup</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={(e)=>setEventName(e.target.value)}
          style={{padding:10,width:"100%",marginBottom:20}}
        />

        {judges.map((j,i)=>(
          <input key={i}
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

        <button style={big} onClick={startEvent}>
          Start Event
        </button>
      </div>
    );
  }

  // ---------- JUDGE SELECT ----------
  if(screen==="judgeSelect"){
    return(
      <div style={{padding:20}}>
        <h2>Select Judge</h2>

        {judges.map((j,i)=>(
          <button key={i} style={big}
            onClick={()=>{setActiveJudge(j);setScreen("score")}}>
            {j}
          </button>
        ))}
      </div>
    );
  }

  // ---------- SCOREBOARD ----------
  if(screen==="score"){
    return(
      <div style={{padding:20}}>
        <h3>{eventName} | {activeJudge}</h3>

        <input
          value={car}
          onChange={(e)=>setCar(e.target.value)}
          placeholder="Entrant No"
          style={{padding:10,width:"100%",marginBottom:20}}
        />

        {/* GENDER */}
        <div style={row}>
          <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
          <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
        </div>

        {/* CLASS */}
        <div style={row}>
          {classes.map(c=>(
            <button key={c}
              style={carClass===c?classActive:btn}
              onClick={()=>setCarClass(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* SCORES */}
        {categories.map(cat=>(
          <div key={cat} style={row}>
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
        <div style={row}>
          <strong>Blown Tyres (+5)</strong><br/>
          <button style={tyres.left?active:btn} onClick={()=>setTyres({...tyres,left:!tyres.left})}>Left</button>
          <button style={tyres.right?active:btn} onClick={()=>setTyres({...tyres,right:!tyres.right})}>Right</button>
        </div>

        {/* DEDUCTIONS */}
        <div style={row}>
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
      </div>
    );
  }

  return <div>Loading...</div>;
}
