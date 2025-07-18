import { Client } from 'pg';
import { ServiceError } from './errors.js';

async function query(config, values) {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(config, values);
    return result;
  } catch (error) {
    const serviceError = new ServiceError({
      message: 'Erro na conexão com Banco ou na Query.',
      cause: error,
    });
    throw serviceError;
  } finally {
    await client?.end();
  }
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: getSSLValues(),
  });
  await client.connect();
  return client;
}

const database = {
  query,
  getNewClient,
};

export default database;

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === 'production' ? true : false;
}
