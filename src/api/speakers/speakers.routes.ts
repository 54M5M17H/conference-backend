import * as Router from 'koa-router';
const speakersRouter = new Router();

import * as speakersController from './speakers.controller';

speakersRouter.get('/', async (ctxt) => {
	ctxt.body = await speakersController.list(ctxt.query);
});

speakersRouter.get('/:speakerId', async (ctxt) => {
	ctxt.body = await speakersController.findById(ctxt.params.speakerId);
});

speakersRouter.post('/', async (ctxt) => {
	ctxt.body = await speakersController.create(ctxt.request.body);
	ctxt.status = 201;
});

speakersRouter.patch('/:speakerId', async (ctxt) => {
	ctxt.body = await speakersController.patch(ctxt.params.speakerId, ctxt.request.body);
});

export default speakersRouter;
