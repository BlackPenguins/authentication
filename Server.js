import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/user.js';
import setupRoutes from './routes/setup.js';

import cors from 'cors';

// How does authentication work?
// Use makes a call to login API with username and password. If password matches, we encrypt all the user data into a JWT token. The token is signed with a KEY only the server knows.
// That token is sent back to the user. They store is in localstorage on client-side. This is safe because they can't see the information in the token.
// If they try to modify the token it will invalidate it.
// When they need to do something that requires login or admin, the client sends the token in the header.
// The application API then makes a call to the authentication API with that token via /checkuser.
// The API endpoint sees the token, validates it against the server KEY, and then decodes it into the user data. That user data is sent back to the application where it can process everything.
// We are sending status codes in JSON to indicate pass/fail.

dotenv.config();

const PORT = process.env.AUTHENTICATION_PORT;
const app = express();

app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);

// Does the parsing for the req.body
app.use(express.json());

app.listen(PORT, () => {
	console.log(`Authentication Server is now running on port ${PORT}.`);
});

app.use(userRoutes);
app.use(setupRoutes);
