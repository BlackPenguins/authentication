import express from 'express';
import { createTables } from '../database/utils.js';

const router = express.Router();

router.post('/setup/createTables', async (req, res) => {
	const createPromise = createTables();

	createPromise.then(
		(result) => {
			res.status(200).json(result);
		},
		(error) => {
			res.status(500).json(error);
		}
	);
});

export default router;
