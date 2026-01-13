# Vacation Tracker

CLI application to track vacation days using Clockify API data.

## Features

- Tracks two types of vacation time:
  - **Congé mobile** (floating holidays)
  - **Vacances** (regular vacation)
- Calculates remaining days based on Clockify time entries
- Supports vacation bank carryover from previous years (converted from CAD)
- Displays monthly breakdown and summary

## Configuration

Create a `.env` file with:

```
CLOCKIFY_API_KEY=your_api_key
CLOCKIFY_WORKSPACE_ID=your_workspace_id
CONGE_MOBILE_DAYS=3
VACANCES_DAYS=25
VACANCES_BANK_CAD=10000
HOURLY_RATE_CAD=60
```

## Usage

```bash
npm start -- --year 2025
```

Default: current year if `--year` is not specified.

## Output

```
Vacation Tracker - 2025

Configuration:
  Congé mobile allocation: 3 days
  Vacances allocation: 25 days
  Vacances bank: 10000 CAD (166.67h / 22.22 days @ 60 CAD/h)
  Total vacances available: 47.22 days

Monthly Breakdown:
┌─────────┬──────────────────┬──────────────────┐
│ Month   │ Congé mobile     │ Vacances         │
├─────────┼──────────────────┼──────────────────┤
│ January │ 0.00h (0.00d)    │ 15.00h (2.00d)   │
│ ...     │ ...              │ ...              │
└─────────┴──────────────────┴──────────────────┘

Summary:
  Congé mobile: 2/3 days remaining (1 used)
  Vacances: 37.22/47.22 days remaining (10 used)
```

## Development

```bash
npm install
npm run build
npm start
```
