import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import sha from 'sha.js';

dotenv.config();

const { sign, verify } = jsonwebtoken;

export const hashPassword = (password) => {
	return sha('sha1').update(password).digest('hex');
};

export const createJSONToken = (userFromDB) => {
	return sign({ userID: userFromDB.UserID, username: userFromDB.UserName }, process.env.JSON_SIGNING_KEY);
};

const verifyJSONToken = (token) => {
	return verify(token, process.env.JSON_SIGNING_KEY);
};

export const checkAuthMiddleware = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		return next();
	}
	if (!req.headers.authorization) {
		console.log('No header.');
		return res.status(401).json({
			message: 'Not Authorized. No authentication header.',
		});
	}
	const authFragments = req.headers.authorization.split(' ');

	if (authFragments.length !== 2) {
		console.log('No token.');
		return res.status(401).json({
			message: 'Not Authorized. Authentication header is invalid.',
		});
	}
	const authToken = authFragments[1];
	try {
		req.decodedUser = verifyJSONToken(authToken);
	} catch (error) {
		console.log('Bad token.');
		return res.status(401).json({
			message: 'Not Authorized. Token is invalid.',
		});
	}

	console.log('Permission Granted.');

	next();
};
