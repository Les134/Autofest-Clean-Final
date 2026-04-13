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
  const [judge,setJudge] = useState("");

  const [car,setCar] = useState("");
  const [driver,setDriver] = useState("");
  const [rego,setRego] = useState("");
  const [carName,setCarName] = useState("");

  const [gender,setGender] = useState("");
  const [carClass,setCarClass] = useState("");

  const [scores,setScores] = useState({});
  const [deductions,setDeductions] = useState({});
  const [tyres,setTyres] = useState({left:false,right:false});

  function setScore(cat,val){
    setScores(prev=>({...prev,[cat]:val}));
  }

  function toggleDeduction(d){
    setDeductions(prev=>({...prev,[d]:!prev[d]}));
  }

  function toggleTyre(side){
    setTyres(prev=>({...prev,[side]:!prev[side]}));
  }

  function submit(){

    if(!car && !driver && !rego && !carName){
      alert("Enter competitor");
      return;
    }

    if(Object.keys(scores).length === 0){
      alert("Add scores");
      return;
    }

    const tyreScore = (tyres.left?5:0)+(tyres.right?5:0);
    const deductionTotal = Object.values(deductions).filter(v=>v).length*10;

    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    const finalScore = total + tyreScore - deductionTotal;

    console.log("FINAL SCORE:", finalScore);

    // RESET FAST
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar("");
    setDriver("");
    setRego("");
    setCarName("");
    setGender("");
    setCarClass("");

    alert("Score Saved ✅");
  }

  const btn = {padding:12,margin:6,borderRadius:6};
  const active = {padding:12,margin:6,borderRadius:6,background:"red",color:"#fff"};
  const big = {padding:16,margin:10,background:"#000",color:"#fff"};
  const row = {marginBottom:20};

  if(screen==="home"){
    return (
      <div style={{height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
        <h1>AutoFest Burnout Champs</h1>
        <button style={big} onClick={()=>setScreen("judges")}>Start Judging</button>
      </div>
    );
  }

  if(screen==="judges"){
    return (
      <div style={{padding:20}}>
        {[1,2,3,4,5,6].map(j=>(
          <button key={j} style={big} onClick={()=>{setJudge(`Judge ${j}`);setScreen("score")}}>
            Judge {j}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{padding:20}}>

      <h2>{judge}</h2>

      <input placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} />
      <input placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

      <div style={row}>
        <button style={gender==="Male"?active:btn} onClick={()=>setGender("Male")}>Male</button>
        <button style={gender==="Female"?active:btn} onClick={()=>setGender("Female")}>Female</button>
      </div>

      <div style={row}>
        {classes.map(c=>(
          <button key={c} style={carClass===c?active:btn} onClick={()=>setCarClass(c)}>
            {c}
          </button>
        ))}
      </div>

      {categories.map(cat=>(
        <div key={cat} style={row}>
          <strong>{cat}</strong><br/>
          {Array.from({length:21},(_,i)=>(
            <button key={i} style={scores[cat]===i?active:btn} onClick={()=>setScore(cat,i)}>
              {i}
            </button>
          ))}
        </div>
      ))}

      <div style={row}>
        <strong>Blown Tyres (5 pts each)</strong><br/>
        <button style={tyres.left?active:btn} onClick={()=>toggleTyre("left")}>Left</button>
        <button style={tyres.right?active:btn} onClick={()=>toggleTyre("right")}>Right</button>
      </div>

      <div style={row}>
        <strong>Deductions</strong><br/>
        {deductionsList.map(d=>(
          <button key={d} style={deductions[d]?active:btn} onClick={()=>toggleDeduction(d)}>
            {d}
          </button>
        ))}
      </div>

      <button style={big} onClick={submit}>Submit</button>
      <button style={big} onClick={()=>setScreen("home")}>Return Home</button>

    </div>
  );
}
