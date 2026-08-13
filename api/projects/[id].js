const { getDb, initSchema, readLocalFile, writeLocalFile } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'Project ID is required' });

  const sql = getDb();

  try {
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, expanded } = body;

      if (sql) {
        await initSchema(sql);
        if (name !== undefined) {
          await sql`UPDATE projects SET name = ${name} WHERE id = ${id}`;
        }
        if (expanded !== undefined) {
          await sql`UPDATE projects SET expanded = ${Boolean(expanded)} WHERE id = ${id}`;
        }
      } else {
        const localProjs = readLocalFile();
        const p = localProjs.find(x => x.id === id);
        if (p) {
          if (name !== undefined) p.name = name;
          if (expanded !== undefined) p.expanded = Boolean(expanded);
          writeLocalFile(localProjs);
        }
      }

      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      if (sql) {
        await initSchema(sql);
        await sql`DELETE FROM tasks WHERE project_id = ${id}`;
        await sql`DELETE FROM projects WHERE id = ${id}`;
      } else {
        let localProjs = readLocalFile();
        localProjs = localProjs.filter(x => x.id !== id);
        writeLocalFile(localProjs);
      }
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Project item API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
