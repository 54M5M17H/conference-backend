import * as httpError from 'http-errors';

import config from '../../config';
import * as baseController from '../../lib/baseControllers';
import talksModel from './talks.model';

const baseMethods = baseController.initialiseController<ITalk>('talk', talksModel);

export const list = baseMethods.list;
export const create = baseMethods.create;
export const patch = (id: string, data: Partial<ITalk>) => {
	if (data && data.attendees) {
		throw httpError.Forbidden('You cannot patch attendees with this route.');
	}
	return baseMethods.patch(id, data);
};

export const findById = async (talkId: string, options: IFindOptions) => {

	if (options.populate && !['null', 'false'].includes(options.populate)) {
		const [talk] = await talksModel.findByIdAndPopulate(talkId);
		if (!talk) {
			throw new httpError.NotFound(`Couldn\'t find that talk.`);
		}
		return talk;
	}
	return baseMethods.findById(talkId);
};

export const rsvpToTalk = async (talkId: string, attendeeId: string): Promise<string> => {
	if (!attendeeId) {
		throw new httpError(401, 'You have not been authenticated.');
	}

	const talkSpot: ITalk | null = await talksModel.rsvpIfSpace(talkId, attendeeId);
	if (!talkSpot) {
		return `This talk is full. There are already ${config.maxAttendance} attendees`;
	}
	return 'You got a spot for the talk';
};
