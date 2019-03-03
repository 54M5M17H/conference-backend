import { Types } from 'mongoose';
import * as should from 'should';
import * as sinon from 'sinon';

import rsvpIfSpace from '../../../src/lib/statics/rsvpIfSpace';

const fakeModel = { rsvpIfSpace, findOneAndUpdate: null, findById: null };
const leanWrapper = (res) => () => ({ lean: () => Promise.resolve(res) });

describe('RSVP static model method: unit tests', () => {
	it('Should return true if talkSpot returns a spot', async () => {
		fakeModel.findOneAndUpdate = leanWrapper({ _id: 123 });
		const result = await fakeModel.rsvpIfSpace('123', '456');
		should(result).equal(true);
	});

	it('Should throw an error if the talk does not exist', async () => {
		try {
			fakeModel.findOneAndUpdate = leanWrapper(null);
			fakeModel.findById = leanWrapper(null);
			await fakeModel.rsvpIfSpace('123', '456');

			return Promise.reject('Should have thrown an error.');
		} catch (error) {
			error.message.should.equal('That talk does not exist');
		}
	});

	it('Should return true if full but attendee has signed up already', async () => {
		const attendeeId = Types.ObjectId();
		fakeModel.findOneAndUpdate = leanWrapper(null);
		fakeModel.findById = leanWrapper({ attendees: [Types.ObjectId(), attendeeId] });
		const result = await fakeModel.rsvpIfSpace('123', attendeeId.toString());
		should(result).equals(true);
	});

	it('Should return false if attendee did not get a space for a full talk', async () => {
		fakeModel.findOneAndUpdate = leanWrapper(null);
		fakeModel.findById = leanWrapper({ attendees: [Types.ObjectId(), Types.ObjectId()] });
		const result = await fakeModel.rsvpIfSpace('123', '8429yrfj');
		should(result).equals(false);
	});
});
