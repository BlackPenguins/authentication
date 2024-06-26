import dotenv from 'dotenv';
import mysql from 'mysql';

export const getPool = () => {
	dotenv.config();

	var pool = mysql.createPool({
		connectionLimit: 99,
		host: process.env.MYSQL_HOST,
		user: process.env.MYSQL_ROOT_USER,
		password: process.env.MYSQL_ROOT_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	});

	return pool;

	// var connection = mysql.createConnection({
	// 	port: process.env.MYSQL_PORT,
	// 	host: process.env.MYSQL_HOST,
	// 	user: process.env.MYSQL_ROOT_USER,
	// 	password: process.env.MYSQL_ROOT_PASSWORD,
	// 	database: process.env.MYSQL_DATABASE,
	// });

	// connection.connect((error) => {
	// 	if (error) throw error;
	// 	query(connection);
	// });

	// connection.end();
};

export const createTables = () => {
	return new Promise((resolve, reject) => {
		getPool().query(
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
