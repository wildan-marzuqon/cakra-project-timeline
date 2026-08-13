# Pomodoro Timer E2E Testing Infrastructure

This document outlines the testing architecture and infrastructure for the Pomodoro Timer web application. The testing framework uses a lightweight, network-isolated, and high-performance approach suitable for constrained execution environments.

## Architecture Overview

The testing framework avoids heavy browser dependencies (such as Playwright or Puppeteer) that require network-dependent binary downloads. Instead, it utilizes:

1. **Test Runner**: Node.js built-in `node:test` runner.
2. **Assertion Library**: Node.js built-in `node:assert`.
3. **DOM & Browser Emulation**: `jsdom` (JSDOM) to load and execute the HTML/JS environment programmatically.
4. **Time Virtualization**: Node's built-in `mock.timers` API to mock and fast-forward intervals (e.g. accelerating 25-minute countdowns into milliseconds).
5. **API Mocking**: Custom mocks for HTML5 `Audio` and the browser `Notification` API.

---

## The 4-Tier E2E Testing Framework

The test suite is structured into four distinct coverage tiers:

### Tier 1: Feature Coverage
Validates the correct operation of all individual core features under normal conditions (>=5 tests per feature).
- **Timer Control & Display (TC)**: Start, pause, resume, reset, and document title updates.
- **Duration Configuration (DC)**: Default values, updating work, short break, and long break settings, and dynamic updating when idle.
- **Session Cycle Management (SC)**: Automatic transition to short break, auto work resume, session counter tracking, long break after 4 work sessions, and loop reset.
- **Notifications & Alerts (NA)**: Alarm triggers at `00:00`, correct sound path, requesting notification permissions, sending notification alerts, and silencing the alarm.

### Tier 2: Boundary & Corner Cases
Ensures the application is resilient and behaves correctly under abnormal inputs, rapid interactions, or edge states (>=5 tests per feature).
- **Timer Control & Display (TC-B)**: Rapid/double clicking, reset when idle, pause when not running, visibility change behavior, and tick boundary at zero.
- **Duration Configuration (DC-B)**: Coercion/handling of negative numbers, zero values, floating point numbers, invalid string characters, and maximum limits (capping).
- **Session Cycle Management (SC-B)**: Retaining cycle count upon manual reset, updating break settings mid-session, active session setting isolation, manual session skipping, and multi-cycle loop-backs.
- **Notifications & Alerts (NA-B)**: Autoplay promise rejection handling, denied notification permissions, continuous alarm looping, memory leaks (audio recreation), and default permission states.

### Tier 3: Cross-Feature Combinations
Covers interactions and states that span multiple feature modules.
- **COMB-01**: Configurations updating idle display, transitioning to start, pausing, resetting, and verifying custom duration preservation.
- **COMB-02**: Complex multi-session runs with customized work, short break, and long break settings.
- **COMB-03**: Resetting during an active break and validating the transition back to work session.
- **COMB-04**: Starting a new session while an alarm from the previous session is still sounding, ensuring the sound stops.
- **COMB-05**: Ultra-short custom work settings completing, verifying automatic alarm and notification triggers.

### Tier 4: Real-World Application Scenarios
Simulates realistic end-user journeys and workflows.
- **SCEN-01 (Golden Path)**: A full Pomodoro cycle: Work 1 -> Short Break -> Work 2 -> Short Break -> Work 3 -> Short Break -> Work 4 -> Long Break -> Work 1.
- **SCEN-02 (Interruption & Reset)**: Interruption during work, pausing, changing short break duration settings, resuming, and manual resetting.
- **SCEN-03 (Settings Validation Journey)**: Attempting to configure invalid values, verifying validation feedback, correcting inputs, and completing a countdown.
- **SCEN-04 (State Recovery)**: Verifying application state persistence (e.g. customized timings and work state) via local storage across page refreshes.

---

## Running the Tests

To run the E2E test suite:

1. Navigate to the tests directory:
   ```bash
   cd pomodoro_timer/tests/
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Execute the test command:
   ```bash
   npm test
   ```
