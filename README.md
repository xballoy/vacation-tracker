# Vacation Tracker

CLI application to track vacation days using Clockify API data.

## Features

- Tracks two types of vacation time:
  - **Congé mobile** (floating holidays)
  - **Vacances** (regular vacation)
- Calculates remaining days based on Clockify time entries
- Supports vacation bank carryover from previous years (converted from CAD)
- Displays monthly breakdown and summary

## Requirements

- Node.js 26 (version pinned in `.nvmrc`)
- pnpm, through Corepack (version pinned in `package.json`)

```bash
corepack enable
pnpm install
```

## Configuration

Create a `.env` file:

```
CLOCKIFY_API_KEY=your_api_key
CLOCKIFY_WORKSPACE_ID=your_workspace_id
CONGE_MOBILE_DAYS=3
VACANCES_DAYS=25
VACANCES_BANK_CAD=5000
HOURLY_RATE_CAD=50
```

Optional settings. The project names shown are the defaults, and verbose output is off unless `VERBOSE=true` is set:

```
CONGE_MOBILE_PROJECT_NAME=Congé mobile
VACANCES_PROJECT_NAME=Vacances
VERBOSE=true
```

## Usage

```bash
pnpm start
pnpm start --year 2025
pnpm start --verbose
```

`-y` and `-v` are short for `--year` and `--verbose`. The year defaults to the current year.

## Development

```bash
pnpm test
pnpm lint
pnpm lint:fix
```
