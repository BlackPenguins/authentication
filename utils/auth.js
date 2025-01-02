import jsonwebtoken from 'jsonwebtoken';
import dotenv from 'dotenv';
import sha from 'sha.js';

dotenv.config();

const { sign, verify } = jsonwebtoken;

export const hashPassword = (password) => {
	return sha('sha1').update(password).digest('hex');
};

export const createJSONToken = (userFromDB) => {
	const tokenObject = {
		userID: userFromDB.UserID,
		username: userFromDB.UserName,
		name: userFromDB.Name,
		isAdmin: userFromDB.IsAdmin,
		email: userFromDB.Email,
		profileColor: userFromDB.ProfileColor,
	};

	return sign(tokenObject, process.env.JSON_SIGNING_KEY);
};

const verifyJSONToken = (token) => {
	return verify(token, process.env.JSON_SIGNING_KEY);
};

export const checkAuthMiddleware = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		return next();
	}
	if (!req.headers.authorization) {
		console.log('No admin bearer header was provided.');
		return res.status(401).json({
			message: 'Not Authorized. No authentication header.',
		});
	}
	const authFragments = req.headers.authorization.split(' ');

	if (authFragments.length !== 2) {
		console.log('Header was provided, but there was no bearer token.');
		return res.status(401).json({
			message: 'Not Authorized. Authentication header is invalid.',
		});
	}
	const authToken = authFragments[1];

	if (authToken == 'null') {
		console.log(`Token was not found. It's null. Was it provided in the header? [${req.headers.authorization}]`);
	}
	try {
		req.decodedUser = verifyJSONToken(authToken);
	} catch (error) {
		console.log(`Error occurred while verifying token [${authToken}]`, error);
		return res.status(500).json({
			message: 'Not Authorized. Token is invalid.',
		});
	}

	console.log('[SUCCESS] Permission Granted!');

	next();
};
