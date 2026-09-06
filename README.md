# ልዩ ሽሮ Profit Tracker

A lightweight React app for recording meal sales and tracking profit in Birr. It is designed for shared use by the two business owners through a host environment that provides `window.storage`.

## Features

- Create, edit, and remove meals with cost and selling price
- Log sales by quantity
- View today's revenue, profit, and profit by meal
- Browse sales history by today, yesterday, the last 7 days, a custom date, or all time
- Export the selected sales history as CSV
- Review meal price changes
- Protect the app with a shared numeric PIN

## How To Run

This repository currently contains the React component only. It does not yet include a `package.json`, Vite/CRA configuration, or an HTML entry point, so it cannot be started directly with `npm start` or `npm run dev` from this folder.

### Run in an existing React project

1. Install the component dependencies in the host project:

```bash
npm install react lucide-react
```

2. Copy `profit-tracker.jsx` into the host project's source directory.

3. Render the component from the host application's entry point:

```jsx
import ProfitTracker from "./profit-tracker";

export default function App() {
	return <ProfitTracker />;
}
```

4. Start the host project's development server using its configured command, for example:

```bash
npm run dev
```

The host environment must provide `window.storage.get` and `window.storage.set`. The component uses those methods for shared storage and passes `true` as the shared-storage flag. A normal browser environment without this API will show the PIN setup flow but will not persist data reliably.

## System Status

### Implemented

- Core meal, sale, price-history, filtering, and CSV-export workflows
- Shared persistence through `window.storage`
- PIN setup, unlock, and manual lock states
- Responsive compact interface for the existing single-page workflow
- Basic loading and save/load error messages

### Current limitations

- No standalone build or deployment configuration is included yet
- `window.storage` is an external host API, not implemented in this repository
- The PIN is a simple shared lock, not full authentication or encryption
- Deleting a meal does not delete its existing sales records
- There are no automated tests or CI configuration
- Validation errors are silently ignored when meal fields are invalid
- Date filtering uses the browser's local display logic together with ISO timestamps, so timezone behavior should be tested for the intended deployment region

## Data Records

The app stores four shared records:

- `authPin`: the shared PIN
- `meals`: meal definitions with name, cost, and selling price
- `sales`: sale snapshots containing meal name, cost, price, quantity, and timestamp
- `priceHistory`: changes to meal cost and selling price

Sales store the cost and price at the time of sale, so later menu-price edits do not change historical profit calculations.

## Project Structure

```text
profit-tracker.jsx  React application component
README.md           Project description and operating notes
```
