import * as seedData from './seedData';

import attendeesModel from '../../src/api/attendees/attendees.model';
import speakersModel from '../../src/api/speakers/speakers.model';

export const seedForTalk = async () => {
	return Promise.all([
		createNSpeakers(1),
		createNAttendees(3),
	]);
};

export const createNAttendees = async (n: number) => {
	const data = seedData.attendees.slice(0, n);
	return (await attendeesModel.create(data)).map(doc => doc.toObject());
};

export const createNSpeakers = async (n: number) => {
	const data = seedData.speakers.slice(0, n);
	return (await speakersModel.create(data)).map(doc => doc.toObject());
};
