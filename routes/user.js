import express from 'express';
import nodemailer from 'nodemailer';
import { get, insert, getAll, updateWithLogin, update, setTempPassword, getByEmail } from '../database/user.js';
import { checkAuthMiddleware, createJSONToken, hashPassword } from '../backend/utils/auth.js';

const router = express.Router();

router.post('/auth/register', async (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const passwordConfirm = req.body.passwordConfirm;
	const name = req.body.name;
	const email = req.body.email;

	if (!username) {
		return res.status(422).json({ message: 'Username is required.' });
	} else if (!password) {
		return res.status(422).json({ message: 'Password is required.' });
	} else if (!passwordConfirm) {
		return res.status(422).json({ message: 'Password confirm is required.' });
	} else if (!name) {
		return res.status(422).json({ message: 'Name is required.' });
	} else if (!email) {
		return res.status(422).json({ message: 'Email is required for password recovery.' });
	} else if (password !== passwordConfirm) {
		return res.status(422).json({ message: 'Passwords must match' });
	} else if (email.indexOf('@') == -1) {
		return res.status(422).json({ message: 'Email is incorrect format.' });
	}

	const existingUsers = await get(username);

	if (existingUsers.length > 0) {
		return res.status(422).json({ message: 'User already exists.' });
	}

	const hashedPassword = hashPassword(password);
	const newUser = await insert(username, hashedPassword, name, email);

	const token = createJSONToken(newUser);

	res.status(200).json({ token, message: `User "${username}" has been created.` });
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
	const databaseTempPassword = usersFound[0].TempPassword;
	const hashedPassword = hashPassword(password);

	let expireDate = new Date(usersFound[0].TempPasswordExpire);
	let currentDate = new Date();
	const isTempPasswordValid = currentDate.getTime() < expireDate.getTime();

	const isValidPassword = hashedPassword === databaseHashedPassword || (isTempPasswordValid && databaseTempPassword === password);

	if (!isValidPassword) {
		return res.status(401).json({
			message: 'Invalid password.',
		});
	}

	const token = createJSONToken(usersFound[0]);

	await updateWithLogin(username);

	return res.status(200).json({
		token,
	});
});

router.post('/auth/updateUser', async (req, res) => {
	checkAuthMiddleware(req, res, async () => {
		const username = req.body.username;
		const profileColor = req.body.profileColor;
		const email = req.body.email;
		const password = req.body.password;
		const displayName = req.body.displayName;
		const usersFound = await get(username);

		if (usersFound.length === 0) {
			return res.status(403).json({
				message: 'User does not exist.',
			});
		}

		const hashedPassword = hashPassword(password);
		const updatedUser = {};

		if (email) {
			updatedUser.Email = email;
		}

		if (profileColor) {
			updatedUser.ProfileColor = profileColor;
		}

		if (hashedPassword) {
			updatedUser.Password = hashedPassword;
		}

		if (displayName) {
			updatedUser.Name = displayName;
		}

		await update(updatedUser, username);

		const newUserFound = await get(username);
		const token = createJSONToken(newUserFound[0]);

		return res.status(200).json({
			token,
			success: true,
		});
	});
});

router.get('/auth/users', async (req, res) => {
	const existingUsers = await getAll();

	const users = existingUsers.map((user) => ({
		userID: user.UserID,
		username: user.UserName,
		isAdmin: user.IsAdmin,
		name: user.Name,
		profileColor: user.ProfileColor,
		email: user.Email,
	}));

	res.status(200).json(users);
});

router.post('/auth/checkuser', async (req, res) => {
	checkAuthMiddleware(req, res, async () => {
		const username = req.decodedUser.username;

		const users = await get(username);
		const user = users[0];

		res.status(200).json({
			name: user.Name,
			username: user.UserName,
			userID: user.UserID,
			isAdmin: user.IsAdmin,
		});
	});
});

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'gamerkd16@gmail.com',
		pass: process.env.SMTP_PASSWORD,
	},
});

transporter
	.verify()
	.then(() => {
		console.log('Email SMTP server connected.');
	})
	.catch((err) => {
		console.error('An error occurred connecting to SMTP server: ', err);
	});

router.post('/auth/forgotPasswordEmail', async (req, res) => {
	const email = req.body.email;

	const usernameResults = await getByEmail(email);

	if (usernameResults.length === 0) {
		res.status(401).json({
			message: 'Could not find an account with that email.',
		});
		return;
	}

	const username = usernameResults[0].UserName;

	const tempPassword = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

	await setTempPassword(tempPassword, username);

	// Step 1: Get the current date
	let currentDate = new Date();

	// Step 2: Add two days to the current date
	currentDate.setDate(currentDate.getDate() + 2);

	// Step 3: Format the date as MM/DD/YYYY
	let month = currentDate.getMonth() + 1;
	let day = currentDate.getDate();
	let year = currentDate.getFullYear();

	let hour = currentDate.getHours();
	let minute = currentDate.getMinutes();

	if (month < 10) month = '0' + month;
	if (day < 10) day = '0' + day;

	const expireDateFormatted = `${month}/${day}/${year} at ${hour}:${minute}`;

	const mailOptions = {
		from: '"PenguinOre" <gamerkd16@gmail.com>',
		to: 'mtm4440@rit.edu',
		subject: 'Forgot your password?',
		text: `A forgotten password request has been made for your ${username} account. Your previous password will continue to work, but an additional temporary password has also been created: ${tempPassword}. Once you login, this temporay password will be removed, and you can change your password in the Profile section. If this wasn't you, you can ignore this email.`,
		html: `A forgotten password request has been made for your <b>${username}</b> PenguinOre account. Your previous password will continue to work, but an additional temporary password has also been created:<div style='font-size: 2em; margin-top: 30px; margin-bottom: 15px;'>${tempPassword}</div> Once you login, this temporary password will be removed, and you can change your password in the Profile section. <i>If this wasn't you, you can ignore this email.</i> <div>The password will expire at <b>${expireDateFormatted}</b>.</div>`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
			res.status(401).json({
				message: 'An error has occurred. Talk to Admin.',
			});
			return;
		}
	});

	res.status(200).json({
		message: 'An email has been sent!',
	});
});

export default router;
