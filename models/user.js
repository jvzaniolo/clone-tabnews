import database from 'infra/database';
import password from './password';
import { ValidationError, NotFoundError } from 'infra/errors';

async function validateUniqueEmail(email) {
  const results = await database.query(`SELECT email FROM users WHERE LOWER(email) = LOWER($1);`, [
    email,
  ]);
  if (results.rowCount > 0) {
    throw new ValidationError({
      message: 'O email informado já está sendo utilizado.',
      action: 'Utilize outro email para realizar esta operação.',
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
      action: 'Utilize outro username para realizar esta operação.',
    });
  }
}

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1',
      [username],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está correto.',
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [userInputValues.username, userInputValues.email, userInputValues.password],
    );
    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);

  if ('username' in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ('email' in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ('password' in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };

  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query(
      `UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING
        *
      `,
      [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    );
    return results.rows[0];
  }
}

const user = {
  create,
  update,
  findOneByUsername,
};

export default user;
