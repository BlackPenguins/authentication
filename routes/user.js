import express from 'express';
import { get, insert, getAll } from '../database/user.js';
import { checkAuthMiddleware, createJSONToken, hashPassword } from '../utils/auth.js';

const router = express.Router();

router.post('/auth/register', async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const passwordConfirm = req.body.passwordConfirm;
	const name = req.body.name;

	let errors = [];

	if (!username || !password || !passwordConfirm || !name) {
		return res.status(422).json({ message: 'You must provide all the information.' });
	} else if (password !== passwordConfirm) {
		return res.status(422).json({ message: 'Passwords must match' });
	}

	const existingUsers = await get(username);

	if (existingUsers.length > 0) {
		return res.status(422).json({ message: 'User already exists.' });
	}

	const hashedPassword = hashPassword(password);
	const newUser = await insert(username, hashedPassword, name);

	const token = createJSONToken(newUser);

	res.status(200).json({ token });
});

router.post('/auth/login', async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const usersFound = await get(username);

	if (usersFound.length === 0) {
		return res.status(403).json({
			message: 'User does not exist.',
		});
	}

	const databaseHashedPassword = usersFound[0].Password;
	const hashedPassword = hashPassword(password);
	const isValidPassword = hashedPassword === databaseHashedPassword;

	if (!isValidPassword) {
		return res.status(401).json({
			message: 'Invalid password.',
		});
	}

	const token = createJSONToken(usersFound[0]);

	return res.status(200).json({
		token,
	});
});

router.get('/auth/users', async (req, res) => {
	const existingUsers = await getAll();

	const users = existingUsers.map((user) => ({
		userID: user.UserID,
		username: user.UserName,
		isAdmin: user.IsAdmin,
		name: user.Name,
	}));

	res.status(200).json(users);
});

router.post('/auth/checkuser', async (req, res) => {
	console.log('CheckUser');
	checkAuthMiddleware(req, res, async () => {
		const username = req.decodedUser.username;

		const users = await get(username);
		const user = users[0];

		res.status(200).json({
			name: user.Name,
			username: user.UserID,
			userID: user.UserName,
			isAdmin: user.IsAdmin,
		});
	});
});

export default router;
