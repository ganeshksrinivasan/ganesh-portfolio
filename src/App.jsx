import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";
import { YEARLY_DATA, MONTHLY_DEPOSITS } from "./data.js";

// ─── Helpers ────────────────────────────────────────────────
const fmt  = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const pct  = (n) => `${n >= 0 ? "+" : ""}${Number(n).toFixed(1)}%`;
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const NAVY  = "#1F3864";
const GOLD  = "#C9A227";
const GREEN = "#2E7D32";
const RED   = "#C62828";
const GREY  = "#546E7A";

// ─── Tooltip ────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${NAVY}20`, borderRadius: 10, padding: "10px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
      <p style={{ fontWeight: 700, color: NAVY, marginBottom: 6, fontSize: 13 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 12, margin: "2px 0" }}>
          {p.name}: <b>{typeof p.value === "number" && Math.abs(p.value) > 10 ? fmt(p.value) : pct(p.value)}</b>
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ───────────────────────────────────────────────
function KPICard({ label, value, sub, color = NAVY }) {
  return (
    <div style={{
      flex: 1, minWidth: 150,
      background: "#fff",
      borderRadius: 12,
      padding: "18px 22px",
      borderTop: `3px solid ${color}`,
      boxShadow: "0 2px 12px rgba(31,56,100,0.07)",
    }}>
      <div style={{ fontSize: 10, color: GREY, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "var(--mono)", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: GREY }}>{sub}</div>
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────
function Section({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 4, height: 20, background: GOLD, borderRadius: 2 }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{title}</span>
      </div>
      {sub && <p style={{ fontSize: 11, color: GREY, marginTop: 4, marginLeft: 14 }}>{sub}</p>}
    </div>
  );
}

// ─── Heatmap ────────────────────────────────────────────────
function Heatmap() {
  const allPos = Object.values(MONTHLY_DEPOSITS).flat().filter(v => v > 0);
  const maxV = Math.max(...allPos);
  const [hovered, setHovered] = useState(null);

  const cellBg = (v) => {
    if (v < 0) return "#FFEBEE";
    if (v === 0) return "#F5F7FA";
    const t = v / maxV;
    return `rgba(31, 56, 100, ${0.08 + 0.82 * t})`;
  };
  const cellFg = (v) => {
    if (v < 0) return RED;
    if (v === 0) return "transparent";
    return v / maxV > 0.35 ? "#fff" : NAVY;
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 3, fontSize: 10, width: "100%" }}>
        <thead>
          <tr>
            <td style={{ width: 44 }} />
            {MONTHS.map(m => (
              <td key={m} style={{ textAlign: "center", color: GREY, fontWeight: 600, paddingBottom: 6, fontSize: 10 }}>{m}</td>
            ))}
            <td style={{ paddingLeft: 12, color: GREY, fontWeight: 600, fontSize: 10 }}>Total</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(MONTHLY_DEPOSITS).map(([yr, months]) => {
            const total = months.reduce((a, b) => a + b, 0);
            return (
              <tr key={yr}>
                <td style={{ fontWeight: 700, color: NAVY, textAlign: "right", paddingRight: 10, fontSize: 11 }}>{yr}</td>
                {months.map((v, mi) => {
                  const key = `${yr}-${mi}`;
                  return (
                    <td
                      key={mi}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered(null)}
                      title={v !== 0 ? fmt(v) : "—"}
                      style={{
                        background: hovered === key ? GOLD : cellBg(v),
                        borderRadius: 5, height: 30,
                        textAlign: "center", verticalAlign: "middle",
                        color: hovered === key ? "#fff" : cellFg(v),
                        fontWeight: 600,
                        cursor: "default",
                        transition: "background 0.15s",
                        minWidth: 44,
                      }}
                    >
                      {v !== 0 ? (Math.abs(v) >= 1000 ? `${v < 0 ? "−" : ""}${Math.round(Math.abs(v)/1000)}K` : v) : ""}
                    </td>
                  );
                })}
                <td style={{ paddingLeft: 12, fontWeight: 700, color: NAVY, fontSize: 11, fontFamily: "var(--mono)" }}>{fmt(total)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────
const TABS = ["Overview", "Returns", "Deposits", "All Years"];

export default function App() {
  const [tab, setTab] = useState("Overview");

  const totalInvested = YEARLY_DATA[YEARLY_DATA.length - 1].cumDeposits;
  const currentValue  = YEARLY_DATA[YEARLY_DATA.length - 1].endValue;
  const totalGain     = currentValue - totalInvested;
  const gainPct       = (totalGain / totalInvested * 100).toFixed(1);
  const totalDivs     = YEARLY_DATA.reduce((a, d) => a + d.divNet, 0);
  const totalInterest = YEARLY_DATA.reduce((a, d) => a + d.interest, 0);
  const bestYear      = [...YEARLY_DATA].sort((a,b) => b.twrr - a.twrr)[0];
  const worstYear     = [...YEARLY_DATA].sort((a,b) => a.twrr - b.twrr)[0];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f3f8" }}>

      {/* ── Header ── */}
      <div style={{ background: NAVY, padding: "0 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              Ganesh · Portfolio Dashboard
            </div>
            <div style={{ fontSize: 12, color: GOLD, marginTop: 2 }}>IBKR · 2019 – 2025 · SGD</div>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "right" }}>
            Personal · Not financial advice
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 20px",
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? NAVY : "rgba(255,255,255,0.6)",
              border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              borderRadius: "8px 8px 0 0",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>

        {/* ── KPI Row ── */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
          <KPICard label="Portfolio Value"  value={fmt(currentValue)}  sub={`+${fmt(currentValue - YEARLY_DATA[YEARLY_DATA.length-2].endValue)} vs last year`} color={NAVY} />
          <KPICard label="Total Invested"   value={fmt(totalInvested)} sub="Net deposits since 2019" color={GREY} />
          <KPICard label="Total Gain"       value={fmt(totalGain)}     sub={`+${gainPct}% on capital`} color={GREEN} />
          <KPICard label="Best Year"        value={pct(bestYear.twrr)} sub={`${bestYear.year} TWRR (IBKR)`} color={GOLD} />
          <KPICard label="Worst Year"       value={pct(worstYear.twrr)} sub={`${worstYear.year} TWRR (IBKR)`} color={RED} />
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Portfolio Value vs. Cumulative Deposits" sub="The gap between the two lines is your market gain — money made without depositing more" />
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={YEARLY_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="year" tick={{ fill: GREY, fontSize: 12, fontFamily: "Outfit" }} />
                  <YAxis tickFormatter={n => `$${(n/1000).toFixed(0)}K`} tick={{ fill: GREY, fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                  <Line type="monotone" dataKey="cumDeposits" name="Cumulative Deposits" stroke={GOLD} strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, fill: GOLD, strokeWidth: 0 }} />
                  <Line type="monotone" dataKey="endValue" name="Portfolio Value" stroke={NAVY} strokeWidth={3} dot={{ r: 5, fill: NAVY, strokeWidth: 0 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Monthly Deposit Heatmap" sub="Hover a cell to highlight · Darker blue = bigger deposit · Red = withdrawal" />
              <Heatmap />
            </div>
          </div>
        )}

        {/* ── RETURNS TAB ── */}
        {tab === "Returns" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              { key: "twrr",    title: "TWRR % per Year",       sub: "Time-weighted return — sourced directly from IBKR",     fmt: "pct" },
              { key: "mtm",     title: "Mark-to-Market Gain",    sub: "Price-driven gains/losses — excludes all cash flows",   fmt: "dollar" },
              { key: "divNet",  title: "Net Dividend Income",    sub: "After withholding tax deductions",                      fmt: "dollar" },
              { key: "interest",title: "Interest Income",        sub: "Grew significantly as rates rose from 2023",            fmt: "dollar" },
            ].map(({ key, title, sub, fmt: f }) => (
              <div key={key} style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
                <Section title={title} sub={sub} />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={YEARLY_DATA} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                    <XAxis dataKey="year" tick={{ fill: GREY, fontSize: 11 }} />
                    <YAxis tickFormatter={n => f === "pct" ? `${n}%` : `$${Math.abs(n/1000).toFixed(0)}K`} tick={{ fill: GREY, fontSize: 11 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke={NAVY} strokeWidth={1} />
                    <Bar dataKey={key} name={title} radius={[4,4,0,0]}>
                      {YEARLY_DATA.map((d, i) => (
                        <Cell key={i} fill={d[key] >= 0 ? (key === "twrr" ? NAVY : key === "mtm" ? GOLD : GREEN) : RED} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* ── DEPOSITS TAB ── */}
        {tab === "Deposits" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Annual Deposits" sub="Fresh capital injected each year" />
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={YEARLY_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0E6EE" />
                  <XAxis dataKey="year" tick={{ fill: GREY, fontSize: 12 }} />
                  <YAxis tickFormatter={n => `$${(n/1000).toFixed(0)}K`} tick={{ fill: GREY, fontSize: 11 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="deposits" name="Deposits" fill={NAVY} radius={[5,5,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
              <Section title="Monthly Deposit Heatmap" sub="Hover a cell to highlight · Darker blue = bigger deposit · Red = withdrawal" />
              <Heatmap />
            </div>
          </div>
        )}

        {/* ── ALL YEARS TAB ── */}
        {tab === "All Years" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(31,56,100,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "24px 28px 16px" }}>
              <Section title="Year-by-Year Performance" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: NAVY }}>
                    {["Year","Deposits","Cum. Invested","Portfolio Value","MtM Gain","TWRR %","Net Divs","Interest"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 16px", color: "#fff", textAlign: i === 0 ? "left" : "right", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {YEARLY_DATA.map((d, i) => {
                    const yoy = i > 0 ? ((d.endValue - YEARLY_DATA[i-1].endValue) / YEARLY_DATA[i-1].endValue * 100) : null;
                    return (
                      <tr key={d.year} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFD", borderBottom: "1px solid #E0E6EE" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: NAVY, fontFamily: "var(--mono)" }}>{d.year}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--mono)" }}>{fmt(d.deposits)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--mono)", color: GREY }}>{fmt(d.cumDeposits)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: NAVY, fontFamily: "var(--mono)" }}>
                          {fmt(d.endValue)}
                          {yoy !== null && <span style={{ marginLeft: 6, fontSize: 11, color: yoy >= 0 ? GREEN : RED }}>({pct(yoy)})</span>}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: d.mtm >= 0 ? GREEN : RED, fontWeight: 600, fontFamily: "var(--mono)" }}>
                          {d.mtm !== 0 ? `${d.mtm >= 0 ? "+" : ""}${fmt(d.mtm)}` : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: d.twrr >= 0 ? GREEN : RED, fontWeight: 700, fontFamily: "var(--mono)" }}>{pct(d.twrr)}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: GREY, fontFamily: "var(--mono)" }}>{d.divNet ? fmt(d.divNet) : "—"}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: GREY, fontFamily: "var(--mono)" }}>{d.interest ? fmt(d.interest) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#EEF2F8", borderTop: `2px solid ${NAVY}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 800, color: NAVY }}>TOTAL</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, fontFamily: "var(--mono)" }}>{fmt(YEARLY_DATA.reduce((a,d)=>a+d.deposits,0))}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: GREY, fontFamily: "var(--mono)" }}>—</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 800, color: NAVY, fontFamily: "var(--mono)" }}>{fmt(currentValue)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 700, color: GREEN, fontFamily: "var(--mono)" }}>+{fmt(YEARLY_DATA.reduce((a,d)=>a+d.mtm,0))}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", color: GREY }}>—</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--mono)" }}>{fmt(totalDivs)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontFamily: "var(--mono)" }}>{fmt(totalInterest)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p style={{ padding: "12px 28px", fontSize: 11, color: GREY, fontStyle: "italic" }}>
              All values in SGD · TWRR sourced directly from IBKR · MtM excludes cash flows · YoY% = year-on-year change in portfolio value
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
