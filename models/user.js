import database from 'infra/database';
import { ValidationError, NotFoundError } from 'infra/errors';

async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const results = await database.query(
      `SELECT email FROM users WHERE LOWER(email) = LOWER($1);`,
      [email],
    );
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: 'O email informado já está sendo utilizado.',
        action: 'Utilize outro email para realizar o cadastro.',
      });
    }
  }

  async function validateUniqueUsername(username) {
    const results = await database.query(
      `SELECT username FROM users WHERE LOWER(username) = LOWER($1);`,
      [username],
    );
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: 'O username informado já está sendo utilizado.',
        action: 'Utilize outro username para realizar o cadastro.',
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [userInputValues.username, userInputValues.email, userInputValues.password],
    );
    return results.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username],
    );

    console.log(result.rows[0]);

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está correto.',
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
