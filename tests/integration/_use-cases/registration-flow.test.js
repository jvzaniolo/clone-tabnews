import webserver from 'infra/webserver';
import activation from 'models/activation';
import orchestrator from 'tests/orchestrator';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe('Use case: Registration Flow (all successful)', () => {
  let createUserResponseBody;

  test('Create user account', async () => {
    const createUserResponse = await fetch('http://localhost:3000/api/v1/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'RegistrationFlow',
        email: 'registration.flow@curso.dev',
        password: 'RegistrationFlowPassword',
      }),
    });

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: 'RegistrationFlow',
      email: 'registration.flow@curso.dev',
      password: createUserResponseBody.password,
      features: ['read:activation_token'],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test('Receive activation email', async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe('<contato@fintab.com.br>');
    expect(lastEmail.recipients[0]).toBe('<registration.flow@curso.dev>');
    expect(lastEmail.subject).toBe('Ative seu cadastro no Fintab!');
    expect(lastEmail.text).toContain('RegistrationFlow');

    const activationTokenId = orchestrator.matchUUID(lastEmail.text);

    expect(lastEmail.text).toContain(`${webserver.origin}/cadastro/ativar/${activationTokenId}`);

    const activationToken = await activation.findOneValidById(activationTokenId);

    expect(activationToken.user_id).toBe(createUserResponseBody.id);
    expect(activationToken.used_at).toBeNull();
  });

  test('Activate user account', async () => {});

  test('Login with new account', async () => {});

  test('Get user information', async () => {});
});
