const { getDb, initSchema, readLocalFile, writeLocalFile } = require('../../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query || {};
  if (!id) return res.status(400).json({ error: 'Task ID is required' });

  const sql = getDb();

  try {
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { name, pic, startDate, endDate } = body;
      const picVal = pic ? pic.trim() : '-';

      if (sql) {
        await initSchema(sql);
        await sql`
          UPDATE tasks
          SET name = ${name}, pic = ${picVal}, start_date = ${startDate}, end_date = ${endDate}
          WHERE id = ${id};
        `;
      } else {
        const localProjs = readLocalFile();
        let found = false;
        localProjs.forEach(p => {
          if (p.tasks) {
            const t = p.tasks.find(x => x.id === id);
            if (t) {
              if (name !== undefined) t.name = name;
              if (pic !== undefined) t.pic = picVal;
              if (startDate !== undefined) t.startDate = startDate;
              if (endDate !== undefined) t.endDate = endDate;
              found = true;
            }
          }
        });
        if (found) writeLocalFile(localProjs);
      }

      return res.status(200).json({ success: true, id });
    }

    if (req.method === 'DELETE') {
      if (sql) {
        await initSchema(sql);
        await sql`DELETE FROM tasks WHERE id = ${id}`;
      } else {
        const localProjs = readLocalFile();
        localProjs.forEach(p => {
          if (p.tasks) {
            p.tasks = p.tasks.filter(x => x.id !== id);
          }
        });
        writeLocalFile(localProjs);
      }
      return res.status(200).json({ success: true, deletedId: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Task item API error:', err);
    return res.status(500).json({ error: err.message });
  }
};
