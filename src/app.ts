import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';

import { connectToDb, disconnectFromDb } from './lib/dbConnection';
import { log } from './lib/logger';

import attendeesRoutes from './api/attendees/attendees.routes';
import speakersRoutes from './api/speakers/speakers.routes';
import talksRoutes from './api/talks/talks.routes';

const handleShutdown = () => {
	disconnectFromDb();
	console.log('\n Shutting down \n');
	process.exit();
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

const start = async () => {

	connectToDb();

	const app = new Koa();
	app.use(bodyParser({ strict: true }));

	app.use(async (ctxt, next) => {
		try {
			await next();
		} catch (error) {
			log(`ERROR: ${error}`);
			ctxt.status = error.status || 500;
			ctxt.body = error.message;
		}
	});

	speakersRoutes.prefix('/api/speakers');
	app.use(speakersRoutes.routes()).use(speakersRoutes.allowedMethods());

	talksRoutes.prefix('/api/talks');
	app.use(talksRoutes.routes()).use(talksRoutes.allowedMethods());

	attendeesRoutes.prefix('/api/attendees');
	app.use(attendeesRoutes.routes()).use(attendeesRoutes.allowedMethods());

	return app.listen(process.env.PORT || 3000);
};

export default start();
