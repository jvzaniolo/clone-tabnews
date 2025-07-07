import database from 'infra/database';
import { InternalServerError } from 'infra/errors';

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();

    const databaseVersionQuery = await database.query('SHOW server_version;');
    const databaseVersion = databaseVersionQuery.rows[0].server_version;

    const maxConnectionsQuery = await database.query('SHOW max_connections;');
    const maxConnections = maxConnectionsQuery.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const openedConnectionsQuery = await database.query(
      'SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1',
      [databaseName],
    );
    const openedConnections = openedConnectionsQuery.rows[0].count;

    return response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          opened_connections: openedConnections,
          max_connections: parseInt(maxConnections),
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({
      cause: error,
    });

    console.log('\nErro dentro do catch do controller:');
    console.error(publicErrorObject);

    return response.status(500).json(publicErrorObject);
  }
}

export default status;
