import * as mongoose from 'mongoose';

import config from '../config';
import { log } from './logger';

export const connectToDb = () => {
	mongoose.connection.on('error', (err: any) => {
		log(`Mongo Error: ${err.message}`);
	});

	mongoose.connection.on('connected', () => {
		log(`MongoDB connected`);
	});

	return mongoose.connect(config.mongoConnectionString);
};

export const disconnectFromDb = () => mongoose.disconnect();
