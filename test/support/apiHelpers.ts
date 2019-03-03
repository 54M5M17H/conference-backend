import * as Bluebird from 'bluebird';
import * as supertest from 'supertest';

import app from '../../src/app';

import attendeesModel from '../../src/api/attendees/attendees.model';
import speakersModel from '../../src/api/speakers/speakers.model';
import talksModel from '../../src/api/talks/talks.model';

before(async () => {
	await runApp();
});

let server;
let supertestInstace;
export const runApp = async () => {
	server = await app;
	await clearDb();
	supertestInstace = supertest(server);
};

export const clearDb = async () => {
	if (!process.env.MONGO_STRING.includes('localhost')) {
		// sanity check
		throw new Error('Stop! Not using local database connection.');
	}

	const collectionsToClear = [attendeesModel, speakersModel, talksModel];
	await Bluebird.each(collectionsToClear, coll => coll.deleteMany({}));
};

const request = (url: string, method = 'get', data = {}) => {
	return supertestInstace[method](url).send(data);
};

export const get = (resourcePath: string) => (path = '') => {
	return request(`${resourcePath}/${path}`);
};

export const patch = (resourcePath: string) => (path = '', data = {}) => {
	return request(`${resourcePath}/${path}`, 'patch', data);
};

export const post = (resourcePath: string) => (path = '', data = {}) => {
	return request(`${resourcePath}/${path}`, 'post', data);
};

export const initrequestHelpers = (resourcePath: string) => ({
	get: get(resourcePath),
	patch: patch(resourcePath),
	post: post(resourcePath),
});

export const rsvpRequest = (talkId: string, attendeeId: string) => {
	return supertestInstace.post(`/api/talks/rsvp/${talkId}`)
		.set('x-attendee-id', attendeeId).send();
};
