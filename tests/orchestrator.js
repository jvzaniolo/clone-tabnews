import retry from 'async-retry';
import { faker } from '@faker-js/faker';
import database from 'infra/database';
import migrator from 'models/migrator';
import user from 'models/user';

async function waitForAllServices() {
  async function waitForWebServer() {
    async function fetchStatusPage() {
      const response = await fetch('http://localhost:3000/api/v1/status');

      if (response.status !== 200) {
        throw Error();
      }
    }

    return retry(fetchStatusPage, { retries: 100, factor: 1, maxTimeout: 1000 });
  }

  await waitForWebServer();
}

async function clearDatabase() {
  await database.query('drop schema public cascade; create schema public;');
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username: userObject?.username || faker.internet.username().replace(/[_.-]/g, ''),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || 'validPassword',
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
