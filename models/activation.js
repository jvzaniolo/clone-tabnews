import email from 'infra/email';
import database from 'infra/database';
import webserver from 'infra/webserver';
import { NotFoundError } from 'infra/errors';

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query(
      `INSERT INTO user_activation_tokens (user_id, expires_at) VALUES ($1, $2) RETURNING *;`,
      [userId, expiresAt],
    );
    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: 'FinTab <contato@fintab.com.br>',
    to: user.email,
    subject: 'Ative seu cadastro no Fintab!',
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no FinTab:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe FinTab`,
  });
}

async function findOneValidById(tokenId) {
  const tokenFound = await runSelectQuery(tokenId);
  return tokenFound;

  async function runSelectQuery(tokenId) {
    const results = await database.query(
      `
        SELECT * FROM user_activation_tokens WHERE id = $1 AND expires_at > NOW() AND used_at IS NULL LIMIT 1
      `,
      [tokenId],
    );

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: 'O token de ativação utilizado não foi encontrado no sistema ou expirou.',
        action: 'Faça um novo cadastro.',
      });
    }

    return results.rows[0];
  }
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
};

export default activation;
