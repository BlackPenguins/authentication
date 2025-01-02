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

export const getByEmail = (email) => {
	return new Promise((resolve, reject) => {
		pool.query('SELECT * FROM user WHERE Email = ?', [email], (error, result) => {
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
		pool.query('UPDATE user SET LastLogin = now(), TotalLogins = TotalLogins + 1, TempPassword = null WHERE UserName = ?', [userName], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};

export const update = (updatedUser, userName) => {
	return new Promise((resolve, reject) => {
		pool.query('UPDATE user SET ? WHERE UserName = ?', [updatedUser, userName], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};

export const setTempPassword = (tempPassword, userName) => {
	return new Promise((resolve, reject) => {
		pool.query(
			'UPDATE user SET TempPassword = ?, TempPasswordExpire = DATE_ADD(CURDATE(), INTERVAL 2 DAY) WHERE UserName = ?',
			[tempPassword, userName],
			(error, result) => {
				if (error) {
					return reject(error.sqlMessage);
				} else {
					return resolve(result);
				}
			}
		);
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

export const insert = (userName, passwordHashed, name, email) => {
	return new Promise((resolve, reject) => {
		pool.query('INSERT INTO user (UserName, Password, Name, Email) VALUES (?,?,?,?)', [userName, passwordHashed, name, email], (error, result) => {
			if (error) {
				return reject(error.sqlMessage);
			} else {
				return resolve(result);
			}
		});
	});
};
