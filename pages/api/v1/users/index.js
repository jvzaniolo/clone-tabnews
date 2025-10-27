import controller from 'infra/controller';
import { createRouter } from 'next-connect';
import user from 'models/user';
import activation from 'models/activation';

const router = createRouter();

router.post(async (request, response) => {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);

  const activationToken = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, activationToken);

  return response.status(201).json(newUser);
});

export default router.handler(controller.errorHandlers);
