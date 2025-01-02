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
};
