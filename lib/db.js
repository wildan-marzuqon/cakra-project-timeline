const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

const INITIAL_DATASET = [
  {
    id: "p_maxmar_3",
    name: "Maxmar Fase 3",
    color: 0,
    expanded: true,
    tasks: [
      { id: "t_1", name: "[New] Penambahan fitur rekapitulasi data", pic: "Rayyan", startDate: "2026-08-05", endDate: "2026-08-06" },
      { id: "t_2", name: "Backend Module Optimization", pic: "Andi", startDate: "2026-08-08", endDate: "2026-08-20" },
      { id: "t_3", name: "User Acceptance Testing", pic: "Wildan", startDate: "2026-08-21", endDate: "2026-08-28" }
    ]
  },
  {
    id: "p_admf_cb",
    name: "ADMF Chatbot",
    color: 1,
    expanded: true,
    tasks: [
      { id: "t_4", name: "Flow Assessment & Intent Mapping", pic: "Wildan", startDate: "2026-08-01", endDate: "2026-08-10" },
      { id: "t_5", name: "Middleware Dev", pic: "Budi", startDate: "2026-08-11", endDate: "2026-08-22" },
      { id: "t_6", name: "Internal Testing", pic: "Sari", startDate: "2026-08-23", endDate: "2026-09-01" }
    ]
  },
  {
    id: "p_bcas_api",
    name: "BCAS API Integration",
    color: 2,
    expanded: true,
    tasks: [
      { id: "t_7", name: "API Mapping", pic: "Reza", startDate: "2026-08-03", endDate: "2026-08-14" },
      { id: "t_8", name: "Integration Dev", pic: "Budi", startDate: "2026-08-15", endDate: "2026-08-28" }
    ]
  }
];

function getDb() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!url || url.trim() === '') return null;
  return neon(url);
}

function readLocalFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.projects)) return parsed.projects;
    }
  } catch (e) {}
  return INITIAL_DATASET;
}

function writeLocalFile(projects) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ projects }, null, 2), 'utf8');
  } catch (e) {}
}

async function initSchema(sql) {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      color INT DEFAULT 0,
      expanded BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(50) PRIMARY KEY,
      project_id VARCHAR(50) REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      pic VARCHAR(100) DEFAULT '-',
      start_date VARCHAR(20) NOT NULL,
      end_date VARCHAR(20) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function seedInitialData(sql) {
  if (!sql) return;
  const existing = await sql`SELECT COUNT(*)::int as cnt FROM projects`;
  if (existing[0].cnt === 0) {
    for (const p of INITIAL_DATASET) {
      await sql`
        INSERT INTO projects (id, name, color, expanded)
        VALUES (${p.id}, ${p.name}, ${p.color}, true);
      `;
      for (const t of p.tasks) {
        await sql`
          INSERT INTO tasks (id, project_id, name, pic, start_date, end_date)
          VALUES (${t.id}, ${p.id}, ${t.name}, ${t.pic}, ${t.startDate}, ${t.endDate});
        `;
      }
    }
  }
}

async function getFullState() {
  const sql = getDb();
  if (!sql) {
    return readLocalFile();
  }
  await initSchema(sql);
  await seedInitialData(sql);

  const projs = await sql`SELECT id, name, color, expanded FROM projects ORDER BY created_at ASC`;
  const tasks = await sql`SELECT id, project_id, name, pic, start_date, end_date FROM tasks ORDER BY start_date ASC`;

  return projs.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    expanded: p.expanded,
    tasks: tasks.filter(t => t.project_id === p.id).map(t => ({
      id: t.id,
      name: t.name,
      pic: t.pic,
      startDate: t.start_date,
      endDate: t.end_date
    }))
  }));
}

module.exports = {
  getDb,
  initSchema,
  seedInitialData,
  getFullState,
  readLocalFile,
  writeLocalFile,
  INITIAL_DATASET
};
