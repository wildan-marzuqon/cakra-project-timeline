const { getDb, getFullState, initSchema, readLocalFile, writeLocalFile } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();

  try {
    if (req.method === 'GET') {
      const state = await getFullState();
      return res.status(200).json({ success: true, projects: state });
    }

    if (req.method === 'POST') {
      const { name, color } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!name) return res.status(400).json({ error: 'Project name is required' });

      const pid = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const colorVal = typeof color === 'number' ? color : 0;
      const newProj = { id: pid, name, color: colorVal, expanded: true, tasks: [] };

      if (sql) {
        await initSchema(sql);
        await sql`
          INSERT INTO projects (id, name, color, expanded)
          VALUES (${pid}, ${name}, ${colorVal}, true);
        `;
      } else {
        const localProjs = readLocalFile();
        localProjs.push(newProj);
        writeLocalFile(localProjs);
      }

      return res.status(201).json({
        success: true,
        project: newProj
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Projects API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
