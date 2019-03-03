import * as Bluebird from 'bluebird';
import { Types } from 'mongoose';

import { clearDb, initrequestHelpers, rsvpRequest } from '../../support/apiHelpers';
import { seedForTalk } from '../../support/dbSeed';

const helpers = initrequestHelpers('/api/talks');
const objId = () => Types.ObjectId().toString();

describe('Talks: Integration', () => {

	describe('Create talk', () => {
		it('Should create a talk', async () => {
			const result = await helpers.post('', {
				attendees: [objId(), objId()],
				speakers: [objId()],
				title: 'Blockchain: Fancy linked list?',
				description: 'Why the public are going crazy about a data structure.',
				startTime: '2019-03-03T09:30',
				durationMins: 30
			});
			result.status.should.equal(201);

			result.body.should.have.property('attendees').instanceOf(Array).length(2);
			result.body.should.have.property('speakers').instanceOf(Array).length(1);
			result.body.should.have.property('title').equal('Blockchain: Fancy linked list?');
			result.body.should.have.property('description').equal('Why the public are going crazy about a data structure.');
			result.body.should.have.property('startTime').startWith('2019-03-03T09:30');
			result.body.should.have.property('durationMins').equal(30);
		});

		it('Should fail validation -- many attendees', async () => {
			const result = await helpers.post('', {
				attendees: Array(31).fill(objId()),
				speakers: [objId()],
				title: 'X',
				description: 'Y',
				startTime: '2019-03-03T10:30',
				durationMins: 30
			});
			result.status.should.equal(500);
			result.text.should.containEql('Cannot have more than 30 attendees');
		});
	});

	describe('Find talk', () => {
		it('Should throw error if talk cannot be found', async () => {
			const result = await helpers.get(objId());
			result.status.should.equal(404);
			result.text.should.equal('Couldn\'t find that talk.');
		});

		it('Should find talk by id', async () => {
			const { body: { _id } } = await helpers.post('', {
				attendees: [objId(), objId(), objId()],
				speakers: [objId(), objId()],
				title: 'Open Banking',
				description: 'An exercise in technical deadlines gone wrong',
				startTime: '2019-03-03T11:30',
				durationMins: 45
			});
			const result = await helpers.get(_id);
			result.body.should.have.property('attendees').instanceOf(Array).length(3);
			result.body.should.have.property('speakers').instanceOf(Array).length(2);
			result.body.should.have.property('title').equal('Open Banking');
			result.body.should.have.property('description').equal('An exercise in technical deadlines gone wrong');
			result.body.should.have.property('startTime').startWith('2019-03-03T11:30');
			result.body.should.have.property('durationMins').equal(45);

			result.body.should.have.property('spacesLeft').equal(27);
		});

		it('Should populate a talk when flag not falsey', async () => {
			const [[speaker], attendees] = await seedForTalk();
			const { body: { _id } } = await helpers.post('', {
				attendees: attendees.map(a => a._id.toString()),
				speakers: [speaker._id.toString()],
				title: 'Revolut App',
				description: 'Saving your money at human cost',
				startTime: '2019-03-03T12:15',
				durationMins: 20
			});

			const result = await helpers.get(`${_id}?populate=true`);
			result.body.attendees.length.should.equal(3);
			result.body.attendees.forEach((a) => {
				a.should.have.properties(['name', 'email']);
			});
			result.body.speakers.length.should.equal(1);
			result.body.speakers.forEach((s) => {
				s.should.have.properties(
					['name', 'bio', 'photo']
				);
			});

			const result2 = await helpers.get(`${_id}?populate=false`);
			result2.body.speakers.forEach(s => s.should.be.instanceOf(String));
			result2.body.attendees.forEach(a => a.should.be.instanceOf(String));
		});
	});

	describe('List talks', () => {

		before(async () => {
			await clearDb();
			await Bluebird.each(Array(12), (_, i) => {
				return helpers.post('', {
					attendees: [objId(), objId(), objId(), objId()],
					speakers: [objId(), objId()],
					title: 'Stripe in 7 lines of code',
					description: '& 120 more',
					startTime: '2019-03-03T12:30',
					durationMins: i
				});
			});
		});

		it('Should return first 10 by default', async() => {
			const result = await helpers.get('');
			result.body.length.should.equal(10);
			result.body.forEach((talk, i) => {
				talk.durationMins.should.equal(i);
				talk.should.have.property('spacesLeft').equal(26);
			});
		});

		it('Should return what is left on second page', async () => {
			const result = await helpers.get('?page=2');
			result.body.length.should.equal(2);
			result.body.forEach((talk, i) => {
				talk.durationMins.should.equal(i + 10);
			});
		});

		it('Should return smaller page', async () => {
			const result = await helpers.get('?page=3&pageSize=3');
			result.body.length.should.equal(3);
			result.body.forEach((talk, i) => {
				talk.durationMins.should.equal(i + 6);
			});
		});
	});

	describe('Patch a talk', () => {
		it('Should return an error when talk does not exist', async () => {
			const result = await helpers.patch(objId(), { startTime: '2019-03-03T13:00', });
			result.status.should.equal(404);
			result.text.should.equal('Couldn\'t find that talk.');
		});

		it('Should be blocked from setting attendees directly', async () => {
			const { body: { _id, durationMins } } = await helpers.post('', {
				attendees: [objId(), objId(), objId()],
				speakers: [objId(), objId()],
				title: 'Making money with Bitcoin',
				description: 'How 50 Cent did it',
				startTime: '2019-03-03T15:30',
				durationMins: 20
			});

			const result = await helpers.patch(_id, { attendees: [] });
			result.status.should.equal(403);
			result.text.should.equal('You cannot patch attendees with this route.');
		});

		it('Should update a talk', async () => {
			const { body: { _id, durationMins } } = await helpers.post('', {
				attendees: [objId(), objId(), objId()],
				speakers: [objId(), objId()],
				title: 'ABBA on Money Laundering Legislation',
				description: 'Knowing me, knowing you',
				startTime: '2019-03-03T13:30',
				durationMins: 40
			});

			durationMins.should.equal(40);

			// this really needs a full hour
			const result = await helpers.patch(_id, { durationMins: 60 });
			result.body.durationMins.should.equal(60);
		});
	});

	describe('RSVP', () => {
		it('Should get an error if not "authenticated"', async () => {
			const result = await rsvpRequest(objId(), '');
			result.status.should.equal(401);
			result.text.should.equal('You have not been authenticated.');
		});

		it('Should get error if talk does not exist', async () => {
			const result = await rsvpRequest(objId(), objId());
			result.status.should.equal(404);
			result.text.should.equal('That talk does not exist');
		});

		it('Should get a spot where there are spaces', async () => {
			const { body: { _id: talkId } } = await helpers.post('', {
				attendees: Array(29).fill(objId()),
				speakers: [objId()],
				title: 'Forgetting Facebook',
				description: 'How the Winklevoss twins made more money online',
				startTime: '2019-03-03T16:10',
				durationMins: 30
			});

			const result = await rsvpRequest(talkId, objId());
			result.text.should.equal('You got a spot for the talk');
		});

		it('Should not get a spot when there are no more spaces', async () => {
			const { body: { _id: talkId } } = await helpers.post('', {
				attendees: Array(30).fill(objId()),
				speakers: [objId()],
				title: 'The Paypal Mafia',
				description: 'From Sicily to Sillicon Valley',
				startTime: '2019-03-03T12:30',
				durationMins: 30
			});

			const result = await rsvpRequest(talkId, objId());
			result.text.should.equal('This talk is full. There are already 30 attendees');
		});

		it('If you already have a spot, should get success message even if full', async () => {
			const attendeeId = objId();
			const { body: { _id: talkId } } = await helpers.post('', {
				attendees: [...Array(29).fill(objId()), attendeeId],
				speakers: [objId()],
				title: 'Monzo',
				description: 'The accidental challenger',
				startTime: '2019-03-03T13:45',
				durationMins: 50
			});

			const result = await rsvpRequest(talkId, attendeeId);
			result.text.should.equal('You got a spot for the talk');
		});

	});
});
