import controller from 'infra/controller';
import user from 'models/user';
import { createRouter } from 'next-connect';

const router = createRouter();

router.get(async (request, response) => {
  const username = request.query.username;
  const userFound = await user.findOneByUsername(username);
  return response.status(200).json(userFound);
});

export default router.handler(controller.errorHandlers);
