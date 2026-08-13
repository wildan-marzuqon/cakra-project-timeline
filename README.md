# Cakra Project Timeline 🚀

A modern, high-performance visual project timeline & Gantt-style workload management web application built with pure HTML5, CSS3, and JavaScript.

![Cakra Project Timeline](https://img.shields.io/badge/Status-Active-brightgreen) ![License-MIT](https://img.shields.io/badge/License-MIT-blue)

## ✨ Key Features

- **Floating Sticky Project Badges**: Project labels stay pinned to the left edge of the screen as you scroll horizontally across long date ranges.
- **Smart Visual Track Packing**: Automatically merges non-overlapping tasks into the same row while using HTML5 Canvas text measurement (`measureText`) to prevent visual overlap between text labels and task bars.
- **High-Contrast Task Blocks**: Crisp, color-coded task bars with 1.5px solid bounding borders and 4px accent indicators for instant date-range visibility at a glance.
- **Inline Task & Project Management**: Add or edit projects and tasks directly in the sidebar tree without annoying popups. Supports optional PICs and quick Enter-key saving.
- **Collapsible Team Workload Summary**: Expand or collapse PIC workload cards showing total active tasks and date ranges per team member.
- **Flexible Filter Popup**: Filter timeline view by custom date ranges, multiple projects, or multiple team members (PICs).
- **Data Export & Backup**: One-click export to Excel (`.xlsx`) spreadsheets or JSON backup files.

## 📁 Repository Structure

```
.
├── index.html        # Main entry point (standalone Web Application)
├── timeline.html     # Timeline Web Application source
├── data/
│   ├── tasks.json    # Existing project & task dataset (JSON)
│   └── tasks.csv     # Existing project & task dataset (CSV)
└── README.md         # Documentation
```

## 🛠️ Usage

Simply open `index.html` or `timeline.html` in any web browser—no build step or server required!

Data is automatically persisted locally in `localStorage` so changes remain intact across browser refreshes.

---
Created for **Cakra Project Timeline**.
