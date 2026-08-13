# Project: Pomodoro Timer

## Architecture
The Pomodoro Timer is a client-side single-page web application. It requires no backend server.
- **HTML5 Markup**: Structure for the display timer, controls, and configuration options.
- **CSS3 Styling**: Embedded styles supporting a modern dark/light aesthetic, responsive layout, clean typography, and smooth transition animations.
- **JavaScript (ES6+)**: Timer state machine, duration configurations, intervals, page updates, and event listeners.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Design & build the E2E test suite covering Tiers 1-4 | none | DONE |
| 2 | Implementation Track | Develop index.html, integrate styles, implement timer logic, pass all E2E tests | 1 | IN_PROGRESS (Conv ID: 50200822-227d-4e50-b3e7-79c7b112acf0) |

## Interface Contracts
The application must expose the following DOM elements with specific IDs for E2E testing:
- `timer-display`: The element displaying the remaining time in MM:SS format.
- `start-btn`: Button to start/resume the timer.
- `pause-btn`: Button to pause the active countdown.
- `reset-btn`: Button to reset the timer to its initial state.
- `work-duration`: Input field for configuring work duration in minutes.
- `break-duration`: Input field for configuring short break duration in minutes.
- `long-break-duration`: Input field for configuring long break duration in minutes.

## Code Layout
- `/Users/wildanmarzuqon/Documents/PM Advancements/Learning/draft/pomodoro_timer/index.html` — Application entry point (single file delivery).
- `/Users/wildanmarzuqon/Documents/PM Advancements/Learning/draft/pomodoro_timer/tests/` — Directory containing E2E test scripts.
