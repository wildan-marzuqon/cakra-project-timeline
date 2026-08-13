const { neon } = require('@neondatabase/serverless');

const INITIAL_DATASET = {
  projects: [
    {
      id: "proj_maxmar_3",
      name: "Maxmar Fase 3",
      color: 0,
      expanded: true,
      tasks: [
        {
          id: "task_1",
          name: "[New] Penambahan fitur rekapitulasi data",
          pic: "Rayyan",
          startDate: "2026-08-05",
          endDate: "2026-08-06"
        },
        {
          id: "task_2",
          name: "Backend Module Optimization",
          pic: "Andi",
          startDate: "2026-08-08",
          endDate: "2026-08-20"
        },
        {
          id: "task_3",
          name: "User Acceptance Testing",
          pic: "Wildan",
          startDate: "2026-08-21",
          endDate: "2026-08-28"
        }
      ]
    },
    {
      id: "proj_admf_cb",
      name: "ADMF Chatbot",
      color: 1,
      expanded: true,
      tasks: [
        {
          id: "task_4",
          name: "Flow Assessment & Intent Mapping",
          pic: "Wildan",
          startDate: "2026-08-01",
          endDate: "2026-08-10"
        },
        {
          id: "task_5",
          name: "Middleware Dev",
          pic: "Budi",
          startDate: "2026-08-11",
          endDate: "2026-08-22"
        },
        {
          id: "task_6",
          name: "Internal Testing",
          pic: "Sari",
          startDate: "2026-08-23",
          endDate: "2026-09-01"
        }
      ]
    },
    {
      id: "proj_bcas_api",
      name: "BCAS API Integration",
      color: 2,
      expanded: true,
      tasks: [
        {
          id: "task_7",
          name: "API Mapping",
          pic: "Reza",
          startDate: "2026-08-03",
          endDate: "2026-08-14"
        },
        {
          id: "task_8",
          name: "Integration Dev",
          pic: "Budi",
          startDate: "2026-08-15",
          endDate: "2026-08-28"
        }
      ]
    }
  ],
  sidebarOpen: true,
  picWorkloadCollapsed: false,
  filters: { startDate: "", endDate: "", projects: [], pics: [] }
};

let isTableInitialized = false;

async function initTable(dbSql) {
  if (isTableInitialized) return;
  try {
    await dbSql`
      CREATE TABLE IF NOT EXISTS timeline_data (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    isTableInitialized = true;
  } catch (err) {
    console.error('Table init error:', err);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    if (req.method === 'GET') {
      return res.status(200).json({ success: true, dbConnected: false, data: INITIAL_DATASET });
    }
    if (req.method === 'POST') {
      return res.status(200).json({ success: true, dbConnected: false });
    }
  }

  try {
    const dbSql = neon(dbUrl);
    await initTable(dbSql);

    if (req.method === 'GET') {
      const rows = await dbSql`SELECT data FROM timeline_data WHERE id = 'main' LIMIT 1`;
      if (rows.length > 0) {
        return res.status(200).json({ success: true, dbConnected: true, data: rows[0].data });
      } else {
        // Auto-seed initial dataset into Vercel Postgres DB if table is empty
        const jsonString = JSON.stringify(INITIAL_DATASET);
        await dbSql`
          INSERT INTO timeline_data (id, data, updated_at)
          VALUES ('main', ${jsonString}::jsonb, NOW())
          ON CONFLICT (id) DO NOTHING;
        `;
        return res.status(200).json({ success: true, dbConnected: true, seeded: true, data: INITIAL_DATASET });
      }
    }

    if (req.method === 'POST') {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!payload) {
        return res.status(400).json({ error: 'Payload body is required' });
      }
      const jsonString = JSON.stringify(payload);
      await dbSql`
        INSERT INTO timeline_data (id, data, updated_at)
        VALUES ('main', ${jsonString}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = ${jsonString}::jsonb, updated_at = NOW();
      `;
      return res.status(200).json({ success: true, dbConnected: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database handler error:', error);
    return res.status(500).json({ error: error.message });
  }
};
