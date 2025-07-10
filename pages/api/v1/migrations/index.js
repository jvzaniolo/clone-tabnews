import { createRouter } from 'next-connect';
import controller from 'infra/controller';
import migrator from 'models/migrator';

const router = createRouter();

router.get(async (request, response) => {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
});

router.post(async (request, response) => {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
});

export default router.handler(controller.errorHandlers);
