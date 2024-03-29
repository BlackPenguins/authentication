import { getDB } from './utils.js';

const db = getDB();

export const get = (userName) => {
	return new Promise((resolve, reject) => {
		db.query('SELECT * FROM user WHERE UserName = ?', [userName], (error, result) => {
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
		db.query('SELECT * FROM user', (error, result) => {
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
		db.query('INSERT INTO user (UserName, Password, Name) VALUES (?,?,?)', [userName, passwordHashed, name], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};
