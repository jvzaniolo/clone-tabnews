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

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);
  return userFound;

  async function runSelectQuery(email) {
    const result = await database.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1',
      [email],
    );

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'O email informado não foi encontrado no sistema.',
        action: 'Verifique se o email está correto.',
      });
    }

    return result.rows[0];
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

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'O username informado não foi encontrado no sistema.',
        action: 'Verifique se o username está correto.',
      });
    }

    return result.rows[0];
  }
}

async function findOneById(id) {
  const userFound = await runSelectQuery(id);
  return userFound;

  async function runSelectQuery(id) {
    const result = await database.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: 'O id informado não foi encontrado no sistema.',
        action: 'Verifique se o id foi digitado corretamente.',
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);
  injectDefaultFeaturesInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const results = await database.query(
      `INSERT INTO users (username, email, password, features) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    );
    return results.rows[0];
  }

  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ['read:activation_token'];
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

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query(
      `UPDATE
        users
      SET
        features = $2,
        updated_at = timezone('utc', now())
      WHERE
        id = $1
      RETURNING *;`,
      [userId, features],
    );
    return results.rows[0];
  }
}

const user = {
  create,
  update,
  findOneById,
  findOneByEmail,
  findOneByUsername,
  setFeatures,
};

export default user;
