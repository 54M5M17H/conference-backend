export default [
	{
		from: 'talks',
		localField: '_id',
		foreignField: 'attendees',
		as: 'talks'
	}
];
