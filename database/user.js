import { getPool } from './utils.js';

const pool = getPool();

export const get = (userName) => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM user WHERE UserName = ?', [userName], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};

export const updateWithLogin = (userName) => {
	return new Promise((resolve, reject) => {
		pool.query('UPDATE user SET LastLogin = now(), TotalLogins = TotalLogins + 1 WHERE UserName = ?', [userName], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};

export const getAll = () => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM user', (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};

export const insert = (userName, passwordHashed, name) => {
	return new Promise((resolve, reject) => {
		pool.query('INSERT INTO user (UserName, Password, Name) VALUES (?,?,?)', [userName, passwordHashed, name], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};
