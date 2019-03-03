import * as Router from 'koa-router';
const attendeesRouter = new Router();

import * as attendeesController from './attendees.controller';

attendeesRouter.get('/', async (ctxt) => {
	ctxt.body = await attendeesController.list(ctxt.query);
});

attendeesRouter.get('/:attendeeId', async (ctxt) => {
	ctxt.body = await attendeesController.findById(ctxt.params.attendeeId, ctxt.query);
});

attendeesRouter.post('/', async (ctxt) => {
	ctxt.body = await attendeesController.create(ctxt.request.body);
});

attendeesRouter.patch('/', async (ctxt) => {
	// taken from the header -- this might be set in prior middleware which validates a bearer token
	ctxt.body = await attendeesController.patch(ctxt.headers['x-attendee-id'], ctxt.request.body);
});

export default attendeesRouter;
