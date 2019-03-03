interface IListOptions {
	page?: number;
	pageSize?: number;
}

interface IFindOptions {
	populate?: string;
}

type TResource = 'speaker' | 'talk' | 'attendee';

interface ISpeaker {
	name: {
		first: string;
		last: string;
	};
	photo: string;
	bio: string;
}

interface ITalk {
	speakers: string[];
	attendees: string[];
	title: string;
	description: string;
	startTime: Date;
	durationMins: number;
}

interface IAttendee {
	name: string;
	email: string;
}

interface IPopulateConfig {
	from: string;
	localField: string;
	foreignField: string;
	as: string;
}
