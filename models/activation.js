import email from 'infra/email';
import database from 'infra/database';
import webserver from 'infra/webserver';

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

async function findOneByUserId(userId) {
  const token = await runSelectQuery(userId);
  return token;

  async function runSelectQuery(userId) {
    const results = await database.query(
      `SELECT * FROM user_activation_tokens WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return results.rows[0];
  }
}

const activation = {
  create,
  sendEmailToUser,
  findOneByUserId,
};

export default activation;
