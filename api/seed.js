const { getDb, initSchema, INITIAL_DATASET, writeLocalFile } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (sql) {
      await initSchema(sql);
      await sql`TRUNCATE TABLE tasks CASCADE;`;
      await sql`TRUNCATE TABLE projects CASCADE;`;

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
    } else {
      writeLocalFile(INITIAL_DATASET);
    }

    return res.status(200).json({ success: true, message: 'Database reset and seeded with initial CSV dataset.' });
  } catch (err) {
    console.error('Seed API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
