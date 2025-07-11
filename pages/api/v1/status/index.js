import { createRouter } from 'next-connect';
import database from 'infra/database';
import controller from 'infra/controller';

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionQuery = await database.query('SHOW server_version');
  const databaseVersion = databaseVersionQuery.rows[0].server_version;

  const maxConnectionsQuery = await database.query('SHOW max_connections');
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
}
