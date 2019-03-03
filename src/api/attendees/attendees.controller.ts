import * as httpError from 'http-errors';

import * as baseController from '../../lib/baseControllers';
import attendeesModel from './attendees.model';

const baseMethods = baseController.initialiseController<IAttendee>('attendee', attendeesModel);

export const list = baseMethods.list;
export const create = baseMethods.create;
export const patch = baseMethods.patch;

export const findById = async (attendeeId: string, options: IFindOptions) => {
	if (options.populate && !['null', 'false'].includes(options.populate)) {
		const [attendee] = await attendeesModel.findByIdAndPopulate(attendeeId);
		if (!attendee) {
			throw new httpError.NotFound(`Couldn\'t find that attendee.`);
		}
		return attendee;
	}
	return baseMethods.findById(attendeeId);
};
