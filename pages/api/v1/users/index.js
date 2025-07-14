import controller from 'infra/controller';
import { createRouter } from 'next-connect';
import user from 'models/user';

const router = createRouter();

router.post(async (request, response) => {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  return response.status(201).json(newUser);
});

export default router.handler(controller.errorHandlers);
