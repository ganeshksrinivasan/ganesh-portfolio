import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

const YEARLY_DATA = [
  { year: "2019", deposits: 10000,  cumDeposits: 10000,   endValue: 9945,   mtm: 0,       twrr: -0.55,  divNet: 0,    interest: 0    },
  { year: "2020", deposits: 65000,  cumDeposits: 75000,   endValue: 97642,  mtm: 22424,   twrr: 32.19,  divNet: 477,  interest: 7    },
  { year: "2021", deposits: 45000,  cumDeposits: 120000,  endValue: 161058, mtm: 17461,   twrr: 16.78,  divNet: 1207, interest: 0    },
  { year: "2022", deposits: 23000,  cumDeposits: 143000,  endValue: 150622, mtm: -34560,  twrr: -19.51, divNet: 844,  interest: 65   },
  { year: "2023", deposits: 34700,  cumDeposits: 177700,  endValue: 235844, mtm: 48114,   twrr: 31.10,  divNet: 1445, interest: 929  },
  { year: "2024", deposits: 34908,  cumDeposits: 212608,  endValue: 327915, mtm: 53082,   twrr: 22.16,  divNet: 1928, interest: 2357 },
  { year: "2025", deposits: 50000,  cumDeposits: 262608,  endValue: 420242, mtm: 38746,   twrr: 11.27,  divNet: 2677, interest: 477  },
  { year: "2026", deposits: 2100,   cumDeposits: 264708,  endValue: 412543, mtm: -9797,   twrr: -2.34,  divNet: 728,  interest: 8    },
];

const MONTHLY_DEPOSITS = {
  2019: [0,0,0,10000,0,0,0,0,0,0,0,0],
  2020: [0,0,37000,0,10000,0,3000,3000,3000,3000,3000,3000],
  2021: [3000,3000,0,20000,3000,3000,2000,0,-3000,3000,3000,8000],
  2022: [0,0,0,0,0,0,0,0,0,0,0,0],
  2023: [3000,3000,3000,3000,3000,3000,2700,8000,0,-3000,1000,8000],
  2024: [8000,2358,3000,18000,2550,-10000,8000,3000,0,0,0,0],
  2025: [6000,1000,4000,12000,1000,-3000,0,5000,1000,3000,0,20000],
  2026: [0,2100,0,0,0,0,0,0,0,0,0,0],
};

const WEEKLY_SPEND = [
  { week: "Jan 2",  VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Jan 5",  VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Jan 9",  VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Jan 12", VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Jan 16", VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Jan 20", VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Jan 23", VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Jan 26", VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Jan 30", VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Feb 2",  VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Feb 5",  VUSD: 0,    IBIT: 0,   MSFT: 1999 },
  { week: "Feb 6",  VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Feb 9",  VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Feb 13", VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Feb 17", VUSD: 0,    IBIT: 40,  MSFT: 0    },
  { week: "Feb 20", VUSD: 500,  IBIT: 0,   MSFT: 0    },
  { week: "Feb 23", VUSD: 0,    IBIT: 40,  MSFT: 0    },
];

const HOLDINGS = [
  { symbol: "SPY",  qty: 263.65, avgCost: 420.77, current: 693.15, value: 182750, gain: 71812  },
  { symbol: "VUSD", qty: 690.29, avgCost: 111.08, current: 131.51, value: 90781,  gain: 14107  },
  { symbol: "MSFT", qty: 48,     avgCost: 209.28, current: 400.60, value: 19229,  gain: 9183   },
  { symbol: "AAPL", qty: 40,     avgCost: 96.29,  current: 274.23, value: 10969,  gain: 7118   },
  { symbol: "UNH",  qty: 40,     avgCost: 280.11, current: 284.20, value: 11368,  gain: 164    },
  { symbol: "IBIT", qty: 30.78,  avgCost: 56.76,  current: 39.23,  value: 1207,   gain: -539   },
];
const HOLDING_COLORS = ["#1F3864","#2E7D32","#C9A227","#546E7A","#7c3aed","#C62828"];
const USD_SGD = 1.284;

const fmt = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct = (n) => `${n >= 0 ? "+" : ""}${Number(n).toFixed(1)}%`;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const NAVY = "#1F3864", GOLD = "#C9A227", GREEN = "#2E7D32", RED = "#C62828", GREY = "#546E7A", ORANGE = "#e05c2a";

const PASSWORD = "ganesh2019";

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const attempt = () => {
    if (input === PASSWORD) { onUnlock(); }
    else { setError(true); setShake(true); setInput(""); setTimeout(() => setShake(false), 500); }
  };
  return (
    <div style={{ minHeight:"100vh", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif" }}>
      <div style={{ background:"white", borderRadius:20, padding:"40px 48px", textAlign:"center", width:320, boxShadow:"0 20px 60px rgba(0,0,0,0.3)", transform:shake?"translateX(-6px)":"none", transition:"transform 0.1s" }}>
        <div style={{ fontSize:36, marginBottom:8 }}>📊</div>
        <h2 style={{ margin:"0 0 4px", color:NAVY, fontSize:20, fontWeight:800 }}>Ganesh · Portfolio</h2>
        <p style={{ margin:"0 0 28px", color:"#94a3b8", fontSize:13 }}>Personal · Not financial advice</p>
        <input type="password" placeholder="Enter password" value={input}
          onChange={e => { setInput(e.target.value); setError(false); }}
          onKeyDown={e => e.key==="Enter" && attempt()}
          style={{ width:"100%", padding:"12px 16px", borderRadius:10, fontSize:15, border:`2px solid ${error?RED:"#e2e8f0"}`, outline:"none", boxSizing:"border-box", marginBottom:error?8:16 }} />
        {error && <p style={{ color:RED, fontSize:12, margin:"0 0 12px" }}>Wrong password</p>}
        <button onClick={attempt} style={{ width:"100%", padding:"12px", background:NAVY, color:"white", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>Unlock</button>
        <p style={{ fontSize:11, color:"#94a3b8", marginTop:16 }}>Hint: ganesh2019</p>
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:`1px solid ${NAVY}20`, borderRadius:10, padding:"10px 16px", boxShadow:"0 8px 24px rgba(0,0,0,0.12)" }}>
      <p style={{ fontWeight:700, color:NAVY, marginBottom:6, fontSize:13 }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, fontSize:12, margin:"2px 0" }}>
          {p.name}: <b>{p.name==="TWRR %" ? pct(p.value) : fmt(p.value)}</b>
        </p>
      ))}
    </div>
  );
};

function KPICard({ label, value, sub, color=NAVY }) {
  return (
    <div style={{ flex:1, minWidth:150, background:"#fff", borderRadius:12, padding:"18px 22px", borderTop:`3px solid ${color}`, boxShadow:"0 2px 12px rgba(31,56,100,0.07)" }}>
      <div style={{ fontSize:10, color:GREY, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:800, color, fontFamily:"monospace", marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:11, color:GREY }}>{sub}</div>
    </div>
  );
}

function Section({ title, sub }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:4, height:20, background:GOLD, borderRadius:2 }} />
        <span style={{ fontSize:15, fontWeight:700, color:NAVY }}>{title}</span>
      </div>
      {sub && <p style={{ fontSize:11, color:GREY, marginTop:4, marginLeft:14 }}>{sub}</p>}
    </div>
  );
}

function Heatmap() {
  const allPos = Object.values(MONTHLY_DEPOSITS).flat().filter(v => v > 0);
  const maxV = Math.max(...allPos);
  const [hovered, setHovered] = useState(null);
  const cellBg = (v) => { if(v<0) return "#FFEBEE"; if(v===0) return "#F5F7FA"; return `rgba(31,56,100,${0.08+0.82*(v/maxV)})`; };
  const cellFg = (v) => { if(v<0) return RED; if(v===0) return "transparent"; return v/maxV>0.35?"#fff":NAVY; };
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ borderCollapse:"separate", borderSpacing:3, fontSize:10, width:"100%" }}>
        <thead><tr>
          <td style={{ width:44 }} />
          {MONTHS.map(m => <td key={m} style={{ textAlign:"center", color:GREY, fontWeight:600, paddingBottom:6, fontSize:10 }}>{m}</td>)}
          <td style={{ paddingLeft:12, color:GREY, fontWeight:600, fontSize:10 }}>Total</td>
        </tr></thead>
        <tbody>
          {Object.entries(MONTHLY_DEPOSITS).map(([yr, months]) => {
            const total = months.reduce((a,b)=>a+b,0);
            return (
              <tr key={yr}>
                <td style={{ fontWeight:700, color:NAVY, textAlign:"right", paddingRight:10, fontSize:11 }}>{yr}</td>
                {months.map((v,mi) => {
                  const key=`${yr}-${mi}`;
                  return (
                    <td key={mi} onMouseEnter={()=>setHovered(key)} onMouseLeave={()=>setHovered(null)} title={v!==0?fmt(v):"—"}
                      style={{ background:hovered===key?GOLD:cellBg(v), borderRadius:5, height:30, textAlign:"center", verticalAlign:"middle", color:hovered===key?"#fff":cellFg(v), fontWeight:600, cursor:"default", transition:"background 0.15s", minWidth:40 }}>
                      {v!==0?(Math.abs(v)>=1000?`${v<0?"−":""}${Math.round(Math.abs(v)/1000)}K`:v):""}
                    </td>
                  );
                })}
                <td style={{ paddingLeft:12, fontWeight:700, color:NAVY, fontSize:11, fontFamily:"monospace" }}>{fmt(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["Overview","Returns","Deposits","All Years","DCA Trades","Holdings"];

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState("Overview");

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const totalInvested = YEARLY_DATA[YEARLY_DATA.length-1].cumDeposits;
  const currentValue  = YEARLY_DATA[YEARLY_DATA.length-1].endValue;
  const totalGain     = currentValue - totalInvested;
  const gainPct       = (totalGain/totalInvested*100).toFixed(1);
  const totalDivs     = YEARLY_DATA.reduce((a,d)=>a+d.divNet,0);
  const totalInterest = YEARLY_DATA.reduce((a,d)=>a+d.interest,0);
  const bestYear      = [...YEARLY_DATA].sort((a,b)=>b.twrr-a.twrr)[0];
  const worstYear     = [...YEARLY_DATA].sort((a,b)=>a.twrr-b.twrr)[0];
  const avgTWRR = (YEARLY_DATA.reduce((s,d)=>s+d.twrr,0)/YEARLY_DATA.length).toFixed(1);
  const yoyChange     = currentValue - YEARLY_DATA[YEARLY_DATA.length-2].endValue;

  // SPY annual total returns 2019–2026 (price + dividends)
  const SPY_ANNUAL = {"2019":31.5,"2020":18.4,"2021":28.7,"2022":-18.2,"2023":26.3,"2024":25.0,"2025":24.9,"2026":-3.8};
  const spyAvgTWRR = 15.2; // geometric mean

  const tabBtn = (t) => (
    <button key={t} onClick={()=>setTab(t)} style={{ padding:"10px 16px", background:tab===t?"#fff":"transparent", color:tab===t?NAVY:"rgba(255,255,255,0.65)", border:"none", cursor:"pointer", fontSize:12, fontWeight:600, borderRadius:"8px 8px 0 0", transition:"all 0.15s", whiteSpace:"nowrap" }}>{t}</button>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0f3f8", fontFamily:"sans-serif" }}>
      <div style={{ background:NAVY, padding:"0 24px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"18px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.02em" }}>Ganesh · Portfolio Dashboard</div>
            <div style={{ fontSize:11, color:GOLD, marginTop:2 }}>IBKR · 2019–{YEARLY_DATA[YEARLY_DATA.length-1].year} · SGD</div>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>Personal · Not financial advice</div>
        </div>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", gap:2, overflowX:"auto" }}>
          {TABS.map(tabBtn)}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px" }}>
        {/* KPIs — only on Overview */}
        {(tab==="Overview" || tab==="Returns" || tab==="Deposits" || tab==="All Years") && (
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:28 }}>
            <KPICard label="Portfolio Value" color={NAVY} value={fmt(currentValue)} sub={`avg ${avgTWRR}% p.a. TWRR · ${yoyChange>=0?"+":""}${fmt(yoyChange)} YoY`} />
            <KPICard label="Total Invested"  color={GREY}  value={fmt(totalInvested)} sub="Net deposits since 2019" />
            <KPICard label="Total Gain"      color={GREEN} value={fmt(totalGain)}     sub={`+${gainPct}% on capital`} />
            <KPICard label="Best Year"       color={GOLD}  value={pct(bestYear.twrr)} sub={`${bestYear.year} TWRR`} />
            <KPICard label="Worst Year"      color={RED}   value={pct(worstYear.twrr)} sub={`${worstYear.year} TWRR`} />
          </div>
        )}

        {/* OVERVIEW */}
        {tab==="Overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Portfolio Value vs. Cumulative Deposits" sub="The gap between the two lines is your market gain — money made without depositing more" />
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={YEARLY_DATA} margin={{ top:10, right:20, left:10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="year" tick={{ fill:GREY, fontSize:11 }} />
                  <YAxis tickFormatter={n=>`$${(n/1000).toFixed(0)}K`} tick={{ fill:GREY, fontSize:11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ paddingTop:12, fontSize:12 }} />
                  <Line type="monotone" dataKey="cumDeposits" name="Cumulative Deposits" stroke={GOLD} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r:4, fill:GOLD, strokeWidth:0 }} />
                  <Line type="monotone" dataKey="endValue" name="Portfolio Value" stroke={NAVY} strokeWidth={3} dot={{ r:5, fill:NAVY, strokeWidth:0 }} activeDot={{ r:7 }} />
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop:12, padding:"10px 16px", background:"#f8fafd", borderRadius:8, borderLeft:`3px solid ${GREY}` }}>
                <span style={{ fontSize:11, color:GREY }}>
                  <b style={{ color:NAVY }}>SPY reference (2019–2026):</b>{" "}
                  {Object.entries(SPY_ANNUAL).map(([yr,r]) => (
                    <span key={yr} style={{ marginRight:10 }}>
                      <span style={{ color:GREY }}>{yr} </span>
                      <span style={{ color:r>=0?GREEN:RED, fontWeight:600 }}>{r>=0?"+":""}{r}%</span>
                    </span>
                  ))}
                  <span style={{ marginLeft:4, color:NAVY, fontWeight:700 }}>· avg {spyAvgTWRR}% p.a.</span>
                  <span style={{ color:GREY, fontSize:10 }}> (geometric, incl. dividends)</span>
                </span>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Annual Returns (TWRR %)" sub="Your year-by-year return — compare against SPY (~25%), Nasdaq (~29%), STI (~5%) for context" />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={YEARLY_DATA} margin={{ top:5, right:20, left:10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="year" tick={{ fill:GREY, fontSize:12 }} />
                  <YAxis tickFormatter={n=>`${n}%`} tick={{ fill:GREY, fontSize:11 }} />
                  <Tooltip formatter={v=>pct(v)} labelStyle={{ fontWeight:700, color:NAVY }} />
                  <ReferenceLine y={0} stroke={NAVY} strokeWidth={1} />
                  <ReferenceLine y={25} stroke={ORANGE} strokeDasharray="4 3" label={{ value:"SPY avg", position:"right", fontSize:10, fill:ORANGE }} />
                  <Bar dataKey="twrr" name="TWRR %" radius={[4,4,0,0]}>
                    {YEARLY_DATA.map((d,i) => <Cell key={i} fill={d.twrr>=0?NAVY:RED} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Monthly Deposit Heatmap" sub="Hover to highlight · Darker = bigger deposit · Red = withdrawal" />
              <Heatmap />
            </div>
          </div>
        )}

        {/* RETURNS */}
        {tab==="Returns" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {[
              { key:"twrr",     title:"TWRR % per Year",     sub:"Time-weighted return from IBKR",          isPct:true  },
              { key:"mtm",      title:"Mark-to-Market Gain", sub:"Price gains/losses, excludes cash flows", isPct:false },
              { key:"divNet",   title:"Net Dividend Income", sub:"After withholding tax",                   isPct:false },
              { key:"interest", title:"Interest Income",     sub:"Grew as rates rose from 2023",            isPct:false },
            ].map(({ key, title, sub, isPct }) => (
              <div key={key} style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
                <Section title={title} sub={sub} />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={YEARLY_DATA} margin={{ top:5, right:10, left:5, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                    <XAxis dataKey="year" tick={{ fill:GREY, fontSize:11 }} />
                    <YAxis tickFormatter={n=>isPct?`${n}%`:`$${Math.abs(n/1000).toFixed(0)}K`} tick={{ fill:GREY, fontSize:11 }} />
                    <Tooltip formatter={v=>isPct?pct(v):fmt(v)} labelStyle={{ fontWeight:700, color:NAVY }} />
                    <ReferenceLine y={0} stroke={NAVY} strokeWidth={1} />
                    <Bar dataKey={key} name={title} radius={[4,4,0,0]}>
                      {YEARLY_DATA.map((d,i) => <Cell key={i} fill={d[key]>=0?(isPct?NAVY:key==="mtm"?GOLD:GREEN):RED} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* DEPOSITS */}
        {tab==="Deposits" && (
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Annual Deposits" sub="Fresh capital injected each year" />
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={YEARLY_DATA} margin={{ top:5, right:20, left:10, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="year" tick={{ fill:GREY, fontSize:12 }} />
                  <YAxis tickFormatter={n=>`$${(n/1000).toFixed(0)}K`} tick={{ fill:GREY, fontSize:11 }} />
                  <Tooltip formatter={v=>fmt(v)} labelStyle={{ fontWeight:700, color:NAVY }} />
                  <Bar dataKey="deposits" name="Deposits" fill={NAVY} radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Monthly Deposit Heatmap" sub="Hover to highlight · Darker = bigger deposit · Red = withdrawal" />
              <Heatmap />
            </div>
          </div>
        )}

        {/* ALL YEARS */}
        {tab==="All Years" && (
          <div style={{ background:"#fff", borderRadius:14, boxShadow:"0 2px 12px rgba(31,56,100,0.06)", overflow:"hidden" }}>
            <div style={{ padding:"24px 24px 12px" }}><Section title="Year-by-Year Performance" /></div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:NAVY }}>
                    {["Year","Deposits","Cum. Invested","Portfolio Value","MtM Gain","TWRR %","Net Divs","Interest"].map((h,i) => (
                      <th key={h} style={{ padding:"12px 14px", color:"#fff", textAlign:i===0?"left":"right", fontWeight:600, fontSize:11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {YEARLY_DATA.map((d,i) => {
                    const yoy = i>0?((d.endValue-YEARLY_DATA[i-1].endValue)/YEARLY_DATA[i-1].endValue*100):null;
                    return (
                      <tr key={d.year} style={{ background:i%2===0?"#fff":"#F8FAFD", borderBottom:"1px solid #E0E6EE" }}>
                        <td style={{ padding:"11px 14px", fontWeight:700, color:NAVY, fontFamily:"monospace" }}>{d.year}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", fontFamily:"monospace" }}>{fmt(d.deposits)}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", fontFamily:"monospace", color:GREY }}>{fmt(d.cumDeposits)}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", fontWeight:700, color:NAVY, fontFamily:"monospace" }}>
                          {fmt(d.endValue)}
                          {yoy!==null && <span style={{ marginLeft:6, fontSize:10, color:yoy>=0?GREEN:RED }}>({pct(yoy)})</span>}
                        </td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:d.mtm>=0?GREEN:RED, fontWeight:600, fontFamily:"monospace" }}>{d.mtm!==0?`${d.mtm>=0?"+":""}${fmt(d.mtm)}`:"—"}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:d.twrr>=0?GREEN:RED, fontWeight:700, fontFamily:"monospace" }}>{pct(d.twrr)}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:GREY, fontFamily:"monospace" }}>{d.divNet?fmt(d.divNet):"—"}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:GREY, fontFamily:"monospace" }}>{d.interest?fmt(d.interest):"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background:"#EEF2F8", borderTop:`2px solid ${NAVY}` }}>
                    <td style={{ padding:"12px 14px", fontWeight:800, color:NAVY }}>TOTAL</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, fontFamily:"monospace" }}>{fmt(YEARLY_DATA.reduce((a,d)=>a+d.deposits,0))}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", color:GREY }}>—</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:800, color:NAVY, fontFamily:"monospace" }}>{fmt(currentValue)}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, color:GREEN, fontFamily:"monospace" }}>+{fmt(YEARLY_DATA.reduce((a,d)=>a+d.mtm,0))}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", color:GREY }}>—</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontFamily:"monospace" }}>{fmt(totalDivs)}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontFamily:"monospace" }}>{fmt(totalInterest)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p style={{ padding:"10px 24px", fontSize:11, color:GREY, fontStyle:"italic" }}>All values in SGD · TWRR from IBKR · MtM excludes cash flows</p>
          </div>
        )}

        {/* DCA TRADES */}
        {tab==="DCA Trades" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {[
                { label:"VUSD buys", value:"8 × ~$500 USD", color:NAVY },
                { label:"IBIT buys", value:"8 × ~$40 USD",  color:GOLD },
                { label:"MSFT buy",  value:"1 × ~$2,000 USD", color:GREEN },
                { label:"Avg/week",  value:"~$540 USD",      color:GREY },
              ].map(s => (
                <div key={s.label} style={{ flex:1, minWidth:140, background:"#fff", borderRadius:12, padding:"16px 18px", borderLeft:`4px solid ${s.color}`, boxShadow:"0 2px 12px rgba(31,56,100,0.07)" }}>
                  <div style={{ fontSize:10, color:GREY, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{s.label}</div>
                  <div style={{ fontSize:17, fontWeight:800, color:s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Weekly Deployment — 2026 YTD" sub="Each bar = one trade date · Consistent cadence across VUSD + IBIT" />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={WEEKLY_SPEND} margin={{ top:5, right:20, bottom:30, left:10 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="week" tick={{ fontSize:10, fill:GREY }} angle={-40} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize:11, fill:GREY }} tickFormatter={v=>`$${v}`} />
                  <Tooltip formatter={(v,name)=>[`$${v} USD`,name]} labelStyle={{ fontWeight:700, color:NAVY }} />
                  <Legend wrapperStyle={{ fontSize:12, paddingTop:8 }} />
                  <Bar dataKey="VUSD" stackId="a" fill={NAVY} />
                  <Bar dataKey="IBIT" stackId="a" fill={GOLD} />
                  <Bar dataKey="MSFT" stackId="a" fill={GREEN} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* HOLDINGS */}
        {tab==="Holdings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ background:"#fff", borderRadius:14, padding:"24px", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title={`Current Portfolio · ${fmt(Math.round(HOLDINGS.reduce((s,h)=>s+h.value,0)*USD_SGD))} SGD`} sub="From latest IBKR statement · USD converted to SGD at 1.284" />
              <div style={{ display:"flex", height:18, borderRadius:8, overflow:"hidden", marginBottom:12 }}>
                {HOLDINGS.map((h,i) => {
                  const total = HOLDINGS.reduce((s,h)=>s+h.value,0);
                  return <div key={h.symbol} title={`${h.symbol}: ${(h.value/total*100).toFixed(1)}%`} style={{ width:`${(h.value/total*100).toFixed(1)}%`, background:HOLDING_COLORS[i] }} />;
                })}
              </div>
              <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
                {HOLDINGS.map((h,i) => {
                  const total = HOLDINGS.reduce((s,h)=>s+h.value,0);
                  return (
                    <div key={h.symbol} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:HOLDING_COLORS[i] }} />
                      <span style={{ fontWeight:700, color:NAVY }}>{h.symbol}</span>
                      <span style={{ color:GREY }}>{(h.value/total*100).toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(31,56,100,0.06)" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:NAVY }}>
                    {["Symbol","Qty","Avg Cost (USD)","Current (USD)","Value (USD)","Value (SGD)","Gain/Loss (SGD)","Return"].map((h,i) => (
                      <th key={h} style={{ padding:"12px 14px", color:"#fff", textAlign:i===0?"left":"right", fontWeight:600, fontSize:11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOLDINGS.map((h,i) => {
                    const ret = parseFloat(((h.current-h.avgCost)/h.avgCost*100).toFixed(1));
                    const gc = h.gain>=0?GREEN:RED;
                    return (
                      <tr key={h.symbol} style={{ borderBottom:"1px solid #E0E6EE", background:i%2===0?"#fff":"#F8FAFD" }}>
                        <td style={{ padding:"11px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:HOLDING_COLORS[i] }} />
                            <span style={{ fontWeight:700, color:NAVY, fontFamily:"monospace" }}>{h.symbol}</span>
                          </div>
                        </td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:GREY, fontFamily:"monospace" }}>{h.qty}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:GREY, fontFamily:"monospace" }}>${h.avgCost}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", fontWeight:600, fontFamily:"monospace" }}>${h.current}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:GREY, fontFamily:"monospace" }}>{fmt(h.value)}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", fontWeight:600, fontFamily:"monospace" }}>{fmt(Math.round(h.value*USD_SGD))}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right", color:gc, fontWeight:600, fontFamily:"monospace" }}>{h.gain>=0?"+":""}{fmt(Math.round(h.gain*USD_SGD))}</td>
                        <td style={{ padding:"11px 14px", textAlign:"right" }}>
                          <span style={{ background:ret>=0?"#f0fdf4":"#fef2f2", color:gc, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700 }}>
                            {ret>=0?"+":""}{ret}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background:"#EEF2F8", borderTop:`2px solid ${NAVY}` }}>
                    <td colSpan={4} style={{ padding:"12px 14px", fontWeight:800, color:NAVY }}>TOTAL</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, color:GREY, fontFamily:"monospace" }}>{fmt(HOLDINGS.reduce((s,h)=>s+h.value,0))}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:800, color:NAVY, fontFamily:"monospace" }}>{fmt(Math.round(HOLDINGS.reduce((s,h)=>s+h.value,0)*USD_SGD))}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right", fontWeight:700, color:GREEN, fontFamily:"monospace" }}>+{fmt(Math.round(HOLDINGS.reduce((s,h)=>s+h.gain,0)*USD_SGD))}</td>
                    <td style={{ padding:"12px 14px", textAlign:"right" }}>
                      <span style={{ background:"#f0fdf4", color:GREEN, padding:"3px 10px", borderRadius:20, fontSize:12, fontWeight:700 }}>
                        +{(HOLDINGS.reduce((s,h)=>s+h.gain,0)/HOLDINGS.reduce((s,h)=>s+h.value-h.gain,0)*100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
              <p style={{ padding:"10px 20px", fontSize:11, color:GREY, fontStyle:"italic" }}>1 USD = {USD_SGD} SGD · Prices from latest IBKR statement</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
