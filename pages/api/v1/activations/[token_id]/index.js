import { createRouter } from 'next-connect';
import controller from 'infra/controller';
import activation from 'models/activation';

const router = createRouter();

router.patch(async (request, response) => {
  const activationTokenId = request.query.token_id;
  const validActivationToken = await activation.findOneValidById(activationTokenId);

  const usedActivationToken = await activation.activateUserByToken(validActivationToken);

  return response.status(200).json(usedActivationToken);
});

export default router.handler(controller.errorHandlers);
