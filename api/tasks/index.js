const { getDb, initSchema, readLocalFile, writeLocalFile } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { projectId, name, pic, startDate, endDate } = body;

      if (!projectId || !name || !startDate || !endDate) {
        return res.status(400).json({ error: 'projectId, name, startDate, and endDate are required' });
      }

      const tid = 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const picVal = pic ? pic.trim() : '-';
      const newTask = { id: tid, name, pic: picVal, startDate, endDate };

      if (sql) {
        await initSchema(sql);
        await sql`
          INSERT INTO tasks (id, project_id, name, pic, start_date, end_date)
          VALUES (${tid}, ${projectId}, ${name}, ${picVal}, ${startDate}, ${endDate});
        `;
      } else {
        const localProjs = readLocalFile();
        const p = localProjs.find(x => x.id === projectId);
        if (p) {
          if (!p.tasks) p.tasks = [];
          p.tasks.push(newTask);
          writeLocalFile(localProjs);
        }
      }

      return res.status(201).json({
        success: true,
        task: newTask
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Tasks API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
