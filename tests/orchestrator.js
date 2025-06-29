import retry from 'async-retry';
import database from 'infra/database';

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

const orchestrator = {
  waitForAllServices,
  clearDatabase,
};

export default orchestrator;
