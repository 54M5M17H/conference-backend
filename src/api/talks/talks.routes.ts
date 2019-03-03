import * as Router from 'koa-router';
const talksRouter = new Router();

import * as talksController from './talks.controller';

talksRouter.get('/', async (ctxt) => {
	ctxt.body = await talksController.list(ctxt.query);
});

talksRouter.get('/:talkId', async (ctxt) => {
	ctxt.body = await talksController.findById(ctxt.params.talkId, ctxt.query);
});

talksRouter.post('/', async (ctxt) => {
	ctxt.body = await talksController.create(ctxt.request.body);
	ctxt.status = 201;
});

talksRouter.patch('/:talkId', async (ctxt) => {
	ctxt.body = await talksController.patch(ctxt.params.talkId, ctxt.request.body);
});

talksRouter.post('/rsvp/:talkId', async (ctxt) => {
	ctxt.body = await talksController.rsvpToTalk(ctxt.params.talkId, ctxt.headers['x-attendee-id']);
});

export default talksRouter;
