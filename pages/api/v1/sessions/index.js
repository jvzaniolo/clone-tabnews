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

router.delete(async (request, response) => {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
});

export default router.handler(controller.errorHandlers);
