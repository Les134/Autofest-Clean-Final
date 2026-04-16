import React, { useState } from "react";

const categories = [
  { name:"Instant Smoke", color:"#ff3c00" },
  { name:"Volume of Smoke", color:"#0099ff" },
  { name:"Constant Smoke", color:"#ffaa00" },
  { name:"Driver Skill & Control", color:"#00cc66" }
];

const classes = [
  "V8 Pro","V8 N/A","6 Cyl Pro","6 Cyl N/A","4Cyl Open/Rotary"
];

export default function App(){

  const [screen,setScreen] = useState("home");
  const [entries,setEntries] = useState([]);

  const [car,setCar] = useState("");
  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");
  const [scores,setScores] = useState({});

  const scoreBtn = {
    width:"36px", height:"36px", margin:"2px",
    borderRadius:"4px", border:"1px solid #ccc"
  };

  const bigBtn = {
    width:"100%", padding:"16px", margin:"6px 0",
    fontSize:"18px"
  };

  const submit = ()=>{
    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    setEntries(prev => [...prev, {
      car, gender, carClass,
      finalScore: total
    }]);

    setScores({});
    setCar("");
    setGender("");
    setCarClass("");
  };

  const sorted = [...entries].sort((a,b)=>b.finalScore-a.finalScore);
  const top150 = sorted.slice(0,150);
  const top30 = sorted.slice(0,30);

  const renderList = (list)=>list.map((e,i)=>(
    <div key={i} style={{
      padding:"10px",
      marginBottom:"6px",
      background:i===0?"#ff3c00":"#1a1a1a",
      color:"#fff"
    }}>
      #{i+1} | Car {e.car} | {e.carClass} | Score {e.finalScore}
    </div>
  ));

  // HOME
  if(screen==="home"){
    return(
      <div style={{padding:20}}>
        <h1>🔥 AUTOFEST LIVE SYNC 🔥</h1>

        <button style={bigBtn} onClick={()=>setScreen("score")}>Return to Score Sheet</button>

        <button style={bigBtn} onClick={()=>setScreen("leader")}>Leaderboard</button>
        <button style={bigBtn} onClick={()=>setScreen("top150")}>Top 150</button>
        <button style={bigBtn} onClick={()=>setScreen("top30")}>Top 30</button>
      </div>
    );
  }

  // SCORE (FIXED LIKE YOUR PHOTO)
  if(screen==="score"){
    return(
      <div style={{padding:20}}>

        <input
          value={car}
          onChange={(e)=>setCar(e.target.value)}
          placeholder="Entrant No"
          style={{width:"100%",padding:10}}
        />

        <div>
          <button onClick={()=>setGender("Male")}>Male</button>
          <button onClick={()=>setGender("Female")}>Female</button>
        </div>

        <div>
          {classes.map(c=>(
            <button key={c} onClick={()=>setCarClass(c)}>{c}</button>
          ))}
        </div>

        {categories.map(cat=>(
          <div key={cat.name} style={{marginTop:10}}>
            <div style={{display:"flex", alignItems:"center"}}>

              <button style={{...scoreBtn,width:"120px"}}>
                {cat.name}
              </button>

              <div style={{display:"flex",flexWrap:"wrap"}}>
                {Array.from({length:21},(_,i)=>(
                  <button key={i}
                    style={{
                      ...scoreBtn,
                      background:scores[cat.name]===i ? cat.color : "#eee",
                      color:scores[cat.name]===i ? "#fff" : "#000"
                    }}
                    onClick={()=>setScores({...scores,[cat.name]:i})}
                  >
                    {i}
                  </button>
                ))}
              </div>

            </div>
          </div>
        ))}

        <button style={bigBtn} onClick={submit}>Submit Score</button>
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>

      </div>
    );
  }

  // LEADERBOARD
  if(screen==="leader"){
    return(
      <div style={{padding:20}}>
        <h2>Leaderboard</h2>
        {renderList(sorted)}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  if(screen==="top150"){
    return(
      <div style={{padding:20}}>
        <h2>Top 150</h2>
        {renderList(top150)}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  if(screen==="top30"){
    return(
      <div style={{padding:20}}>
        <h2>Top 30</h2>
        {renderList(top30)}
        <button style={bigBtn} onClick={()=>setScreen("home")}>Home</button>
      </div>
    );
  }

  return <div>Loading...</div>;
}
