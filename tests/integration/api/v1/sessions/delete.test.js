import setCookieParser from 'set-cookie-parser';
import session from 'models/session';
import orchestrator from 'tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe('DELETE /api/v1/session', () => {
  describe('Default user', () => {
    test('With nonexistent session', async () => {
      const nonexistentToken =
        '58ad0d6bf2f11e9b1f4ff9d1ca811fedfef93d96e50738d7260f4e98dd512ac0e654cb343abce88e1f18dad976f630a9';

      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'DELETE',
        headers: {
          Cookie: `session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se este usuário está logado e tente novamente.',
        status_code: 401,
      });
    });

    test('With expired session', async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: 'UserWithExpiredSession',
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'DELETE',
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se este usuário está logado e tente novamente.',
        status_code: 401,
      });
    });

    test('With valid session', async () => {
      const createdUser = await orchestrator.createUser({
        username: 'UserWithValidSession',
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch('http://localhost:3000/api/v1/sessions', {
        method: 'DELETE',
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: sessionObject.id,
        token: sessionObject.token,
        user_id: sessionObject.user_id,
        updated_at: responseBody.updated_at,
        created_at: responseBody.created_at,
        expires_at: responseBody.expires_at,
      });

      expect(responseBody.expires_at < sessionObject.expires_at.toISOString()).toEqual(true);
      expect(responseBody.updated_at > sessionObject.updated_at.toISOString()).toEqual(true);

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: 'session_id',
        value: 'invalid',
        maxAge: -1,
        path: '/',
        httpOnly: true,
      });

      // Double check assertions
      const doubleCheckResponse = await fetch('http://localhost:3000/api/v1/user', {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: 'UnauthorizedError',
        message: 'Usuário não possui sessão ativa.',
        action: 'Verifique se este usuário está logado e tente novamente.',
        status_code: 401,
      });
    });
  });
});
