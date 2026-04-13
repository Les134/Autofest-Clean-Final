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

  const [entries,setEntries] = useState([]);
  const [saving,setSaving] = useState(false);

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

  function setScore(cat,val){
    setScores(prev=>({...prev,[cat]:val}));
  }

  function toggleDeduction(d){
    setDeductions(prev=>({...prev,[d]:!prev[d]}));
  }

  function toggleTyre(side){
    setTyres(prev=>({...prev,[side]:!prev[side]}));
  }

  async function submit(){

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
    const total = Object.values(scores).reduce((a,b)=>a+b,0);

    const finalScore = total + tyreScore - deductionTotal;

    await addDoc(collection(db,"scores"),{
      car, driver, rego, carName,
      gender, carClass,
      finalScore,
      time: Date.now()
    });

    // RESET FAST
    setScores({});
    setDeductions({});
    setTyres({left:false,right:false});
    setCar(""); setDriver(""); setRego(""); setCarName("");
    setGender(""); setCarClass("");

    setSaving(false);
  }

  const sorted = [...entries].sort((a,b)=>b.finalScore - a.finalScore);

  const scoreBtn = {padding:14,margin:6};
  const scoreActive = {padding:14,margin:6,background:"red",color:"#fff"};

  const genderBtn = {padding:14,margin:6,background:"#1976d2",color:"#fff"};
  const genderActive = {padding:14,margin:6,background:"#0d47a1",color:"#fff"};

  const classBtn = {padding:14,margin:6,background:"#ff9800"};
  const classActive = {padding:14,margin:6,background:"#e65100",color:"#fff"};

  const deductionBtn = {padding:14,margin:6,background:"#555",color:"#fff"};
  const deductionActive = {padding:14,margin:6,background:"#b71c1c",color:"#fff"};

  const row = {marginBottom:30};

  return (
    <div style={{padding:20}}>

      <h2>AutoFest Judging</h2>

      <input style={{width:"100%",padding:14,marginBottom:8}} placeholder="Car #" value={car} onChange={e=>setCar(e.target.value)} />
      <input style={{width:"100%",padding:14,marginBottom:8}} placeholder="Driver" value={driver} onChange={e=>setDriver(e.target.value)} />
      <input style={{width:"100%",padding:14,marginBottom:8}} placeholder="Rego" value={rego} onChange={e=>setRego(e.target.value)} />
      <input style={{width:"100%",padding:14,marginBottom:8}} placeholder="Car Name" value={carName} onChange={e=>setCarName(e.target.value)} />

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

      <button style={{padding:18,background:"black",color:"#fff",width:"100%"}} onClick={submit}>
        {saving ? "Saving..." : "Submit Score"}
      </button>

      <hr/>

      <h2>Leaderboard</h2>

      {sorted.map((e,i)=>(
        <div key={i} style={{marginBottom:10,fontSize:18}}>
          #{i+1} | Car {e.car} | {e.carClass} | {e.gender} | {e.finalScore} pts
        </div>
      ))}

    </div>
  );
}
