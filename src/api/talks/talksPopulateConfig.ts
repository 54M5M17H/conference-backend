export default [
	{
		from: 'speakers',
		localField: 'speakers',
		foreignField: '_id',
		as: 'speakers'
	},
	{
		from: 'attendees',
		localField: 'attendees',
		foreignField: '_id',
		as: 'attendees'
	}
];
