# Ganesh · Portfolio Dashboard

Personal IBKR portfolio tracker. Built with React + Recharts. Deployed on Vercel.

## Updating your data

Every year when you get your IBKR statement, open **`src/data.js`** and:

1. Add a new row to `YEARLY_DATA`
2. Add a new row to `MONTHLY_DEPOSITS`
3. Save → Vercel deploys automatically

That's it!

## Running locally

```bash
npm install
npm run dev
```

## Tech stack
- React 18
- Recharts (charts)
- Vite (build tool)
- Vercel (hosting)
