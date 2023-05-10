import dotenv from 'dotenv';
import mysql from 'mysql';

let _db = null;

export const initializeDB = () => {
	dotenv.config();

	const db = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.AUTHENTICATION_DATABASE,
	});

	db.connect((error) => {
		if (error) {
			throw error;
		}
		console.log('Authentication Server connected to database.');
	});

	_db = db;
};

export const createTables = () => {
	return new Promise((resolve, reject) => {
		_db.query(
			'CREATE TABLE User (UserID INT AUTO_INCREMENT PRIMARY KEY, UserName VarChar(50), Password VARCHAR(500), Name VARCHAR(50), IsAdmin TINYINT)',
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

export const getDB = () => {
	if (_db === null) {
		initializeDB();
	}

	return _db;
};
