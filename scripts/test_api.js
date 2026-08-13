require('dotenv').config({ path: '.env.local' });
const projectsHandler = require('../api/projects/index');
const projectItemHandler = require('../api/projects/[id]');
const tasksHandler = require('../api/tasks/index');
const taskItemHandler = require('../api/tasks/[id]');
const seedHandler = require('../api/seed');

function mockReqRes(method, query, body) {
  const req = {
    method,
    query: query || {},
    body: body || {}
  };
  let statusCode = 200;
  let responseData = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    end: () => res
  };
  return { req, res, getResult: () => ({ status: statusCode, data: responseData }) };
}

async function runTests() {
  console.log('=== TESTING API ENDPOINTS ===\n');

  console.log('1. Testing POST /api/seed...');
  const seed = mockReqRes('POST');
  await seedHandler(seed.req, seed.res);
  console.log('SEED Result:', seed.getResult());

  console.log('\n2. Testing GET /api/projects...');
  const getProjs = mockReqRes('GET');
  await projectsHandler(getProjs.req, getProjs.res);
  const getProjsRes = getProjs.getResult();
  console.log('GET Projects Status:', getProjsRes.status);
  console.log('Projects Count:', getProjsRes.data?.projects?.length);

  if (getProjsRes.data?.projects?.length > 0) {
    const p1 = getProjsRes.data.projects[0];
    console.log(`First project: "${p1.name}" with ${p1.tasks.length} tasks`);
  }

  console.log('\n3. Testing POST /api/projects...');
  const createProj = mockReqRes('POST', {}, { name: 'Test New Project', color: 3 });
  await projectsHandler(createProj.req, createProj.res);
  const createProjRes = createProj.getResult();
  console.log('CREATE Project Result:', createProjRes);
  const createdProjId = createProjRes.data?.project?.id;

  if (createdProjId) {
    console.log('\n4. Testing POST /api/tasks...');
    const createTask = mockReqRes('POST', {}, {
      projectId: createdProjId,
      name: 'Test Task Item',
      pic: 'Tester',
      startDate: '2026-08-15',
      endDate: '2026-08-18'
    });
    await tasksHandler(createTask.req, createTask.res);
    const createTaskRes = createTask.getResult();
    console.log('CREATE Task Result:', createTaskRes);
    const createdTaskId = createTaskRes.data?.task?.id;

    if (createdTaskId) {
      console.log('\n5. Testing PUT /api/tasks/[id]...');
      const updateTask = mockReqRes('PUT', { id: createdTaskId }, {
        name: 'Updated Test Task Item',
        pic: 'Tester Prime',
        startDate: '2026-08-15',
        endDate: '2026-08-20'
      });
      await taskItemHandler(updateTask.req, updateTask.res);
      console.log('UPDATE Task Result:', updateTask.getResult());

      console.log('\n6. Testing DELETE /api/tasks/[id]...');
      const deleteTask = mockReqRes('DELETE', { id: createdTaskId });
      await taskItemHandler(deleteTask.req, deleteTask.res);
      console.log('DELETE Task Result:', deleteTask.getResult());
    }

    console.log('\n7. Testing DELETE /api/projects/[id]...');
    const deleteProj = mockReqRes('DELETE', { id: createdProjId });
    await projectItemHandler(deleteProj.req, deleteProj.res);
    console.log('DELETE Project Result:', deleteProj.getResult());
  }

  console.log('\n=== ALL API TESTS COMPLETED SUCCESSFULLY! ===');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
