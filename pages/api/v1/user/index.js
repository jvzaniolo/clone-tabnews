import controller from 'infra/controller';
import { createRouter } from 'next-connect';
import user from 'models/user';
import session from 'models/session';

const router = createRouter();

router.get(async (request, response) => {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSession = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSession.token, response);

  const userFound = await user.findOneById(sessionObject.user_id);

  response.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
  return response.status(200).json(userFound);
});

export default router.handler(controller.errorHandlers);
