import database from 'infra/database';
import orchestrator from 'tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query('drop schema public cascade; create schema public;');
});

test('DELETE to /api/v1/migrations should return 405', async () => {
  const response1 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'DELETE',
  });
  expect(response1.status).toBe(405);

  const response2 = await fetch('http://localhost:3000/api/v1/status');
  expect(response2.status).toBe(200);
  const response2Body = await response2.json();

  expect(response2Body.dependencies.database.opened_connections).toBe(1);
});
