import React, { useState } from "react";

export default function App() {

  const [screen, setScreen] = useState("home");
  const [judge, setJudge] = useState("");
  const [eventName, setEventName] = useState("");
  const [judges, setJudges] = useState(["", "", "", "", "", ""]);
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState({
    number: "",
    gender: "",
    class: "",
    instant: 0,
    volume: 0,
    constant: 0,
    skill: 0,
    blown: 0,
    deductions: 0
  });

  const submitScore = () => {
    if (!form.number) return alert("Enter car number");

    const total =
      form.instant +
      form.volume +
      form.constant +
      form.skill +
      form.blown -
      form.deductions;

    const newScore = {
      ...form,
      total,
      judge
    };

    setScores([...scores, newScore]);

    setForm({
      number: "",
      gender: "",
      class: "",
      instant: 0,
      volume: 0,
      constant: 0,
      skill: 0,
      blown: 0,
      deductions: 0
    });

    alert("Saved ✔");
  };

  const leaderboard = [...scores].sort((a, b) => b.total - a.total);

  // ================= HOME =================
  if (screen === "home") {
    return (
      <div style={{ padding: 20 }}>
        <h1>🏁 AUTOFEST</h1>

        <button onClick={() => setScreen("setup")}>New Event</button>
        <button onClick={() => setScreen("login")}>Judge Login</button>
        <button onClick={() => setScreen("leaderboard")}>Leaderboard</button>
      </div>
    );
  }

  // ================= SETUP =================
  if (screen === "setup") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Event Setup</h2>

        <input
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />

        {judges.map((j, i) => (
          <input
            key={i}
            placeholder={`Judge ${i + 1}`}
            onChange={(e) => {
              const copy = [...judges];
              copy[i] = e.target.value;
              setJudges(copy);
            }}
          />
        ))}

        <button onClick={() => setScreen("home")}>Save</button>
      </div>
    );
  }

  // ================= LOGIN =================
  if (screen === "login") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Select Judge</h2>

        {judges.map((j, i) =>
          j ? (
            <button
              key={i}
              onClick={() => {
                setJudge(j);
                setScreen("score");
              }}
            >
              {j}
            </button>
          ) : null
        )}
      </div>
    );
  }

  // ================= SCORE =================
  if (screen === "score") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Judge: {judge}</h2>

        <input
          placeholder="Car Number"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
        />

        <div>
          Gender:
          <button onClick={() => setForm({ ...form, gender: "Male" })}>
            Male
          </button>
          <button onClick={() => setForm({ ...form, gender: "Female" })}>
            Female
          </button>
        </div>

        <div>
          Class:
          {["V8 Pro", "V8 NA", "6 Cyl", "4 Cyl"].map((c) => (
            <button
              key={c}
              onClick={() => setForm({ ...form, class: c })}
            >
              {c}
            </button>
          ))}
        </div>

        {["instant", "volume", "constant", "skill"].map((key) => (
          <div key={key}>
            {key}:
            {[...Array(21).keys()].map((n) => (
              <button
                key={n}
                onClick={() => setForm({ ...form, [key]: n })}
              >
                {n}
              </button>
            ))}
          </div>
        ))}

        <div>
          Blown Tyre:
          <button onClick={() => setForm({ ...form, blown: form.blown + 5 })}>
            +5
          </button>
        </div>

        <div>
          Deductions:
          <button
            onClick={() =>
              setForm({ ...form, deductions: form.deductions + 10 })
            }
          >
            -10
          </button>
        </div>

        <br />

        <button onClick={submitScore}>Submit & Next</button>
        <button onClick={() => setScreen("home")}>Home</button>
      </div>
    );
  }

  // ================= LEADERBOARD =================
  if (screen === "leaderboard") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Leaderboard</h2>

        {leaderboard.map((s, i) => (
          <div key={i}>
            #{i + 1} Car {s.number} - {s.total}
          </div>
        ))}

        <button onClick={() => window.print()}>Print</button>
        <button onClick={() => setScreen("home")}>Home</button>
      </div>
    );
  }
}
