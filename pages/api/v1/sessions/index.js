import { createRouter } from 'next-connect';
import controller from 'infra/controller';
import authentication from 'models/authentication';
import session from 'models/session';

const router = createRouter();

router.post(async (request, response) => {
  const userInputValues = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, response);
  return response.status(201).json(newSession);
});

export default router.handler(controller.errorHandlers);
