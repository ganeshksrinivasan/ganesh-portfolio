// ============================================================
// YOUR PORTFOLIO DATA
// Update this file each year when you get your IBKR statement
// ============================================================

export const YEARLY_DATA = [
  // year        : the year
  // deposits    : total fresh capital added that year (SGD)
  // cumDeposits : running total of all deposits ever made
  // endValue    : portfolio value at end of year (from IBKR NAV)
  // mtm         : mark-to-market gain/loss (price changes only, no cash flows)
  // twrr        : time-weighted return % as reported by IBKR
  // divNet      : dividends received net of withholding tax
  // interest    : interest income earned

  { year: "2019", deposits: 10000,  cumDeposits: 10000,   endValue: 9945,   mtm: 0,       twrr: -0.55,  divNet: 0,    interest: 0    },
  { year: "2020", deposits: 65000,  cumDeposits: 75000,   endValue: 97642,  mtm: 22424,   twrr: 32.19,  divNet: 477,  interest: 7    },
  { year: "2021", deposits: 45000,  cumDeposits: 120000,  endValue: 161058, mtm: 17461,   twrr: 16.78,  divNet: 1207, interest: 0    },
  { year: "2022", deposits: 23000,  cumDeposits: 143000,  endValue: 150622, mtm: -34560,  twrr: -19.51, divNet: 844,  interest: 65   },
  { year: "2023", deposits: 34700,  cumDeposits: 177700,  endValue: 235844, mtm: 48114,   twrr: 31.10,  divNet: 1445, interest: 929  },
  { year: "2024", deposits: 34908,  cumDeposits: 212608,  endValue: 327915, mtm: 53082,   twrr: 22.16,  divNet: 1928, interest: 2357 },
  { year: "2025", deposits: 50000,  cumDeposits: 262608,  endValue: 420242, mtm: 38746,   twrr: 11.27,  divNet: 2677, interest: 477  },

  // ── ADD NEW YEARS BELOW THIS LINE ──────────────────────────
  { year: "2026", deposits: 2100, cumDeposits: 266808, endValue: 412543, mtm: -9797, twrr: -2.34, divNet: 728, interest: 7.74 },
];

export const MONTHLY_DEPOSITS = {
  // Each array = [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec]
  // Negative numbers = withdrawals
  2019: [0,    0,     0,     10000, 0,     0,      0,    0,    0,    0,    0,    0    ],
  2020: [0,    0,     37000, 0,     10000, 0,      3000, 3000, 3000, 3000, 3000, 3000 ],
  2021: [3000, 3000,  0,     20000, 3000,  3000,   2000, 0,   -3000, 3000, 3000, 8000 ],
  2022: [0,    0,     0,     0,     0,     0,      0,    0,    0,    0,    0,    0    ],
  2023: [3000, 3000,  3000,  3000,  3000,  3000,   2700, 8000, 0,   -3000, 1000, 8000 ],
  2024: [8000, 2358,  3000,  18000, 2550, -10000,  8000, 3000, 0,    0,    0,    0    ],
  2025: [6000, 1000,  4000,  12000, 1000,  -3000,  0,    5000, 1000, 3000, 0,    20000],

  // ── ADD NEW YEARS BELOW THIS LINE ──────────────────────────
  2026: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

// Pre-IBKR income (from your Summary sheet)
export const PRE_IBKR_INCOME = [
  { year: "2015", netIncome: 28249 },
  { year: "2016", netIncome: 65244 },
  { year: "2017", netIncome: 80954 },
  { year: "2018", netIncome: 93230 },
];
