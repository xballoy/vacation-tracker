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

Create a `.env` file:

```
CLOCKIFY_API_KEY=your_api_key
CLOCKIFY_WORKSPACE_ID=your_workspace_id
CONGE_MOBILE_DAYS=3
VACANCES_DAYS=25
VACANCES_BANK_CAD=10000
HOURLY_RATE_CAD=60
```

Optional settings:

```
CONGE_MOBILE_PROJECT_NAME=Congé mobile
VACANCES_PROJECT_NAME=Vacances
VERBOSE=false
```

## Usage

```bash
pnpm dev
pnpm dev -- --year 2025
pnpm dev -- --verbose
```
