import { Schema, SchemaTypes } from 'mongoose';

import config from '../../config';

const talksSchemaObject = {
	speakers: {
		type: [SchemaTypes.ObjectId],
		refPath: 'Speaker',
		required: true,
		validate: {
			validator: (value) => value.length >= 1,
			message: 'This talk needs at least one speaker'
		}
	},
	attendees: {
		type: [SchemaTypes.ObjectId],
		ref: 'Attendee',
		required: true,
		validate: {
			validator: (value) => {
				return value.length <= config.maxAttendance;
			},
			message: `Cannot have more than ${config.maxAttendance} attendees`
		}
	},
	title: { type: String, required: true },
	description: { type: String, required: true },
	startTime: { type: Date, required: true },
	durationMins: { type: Number, required: true }
};

export default new Schema(talksSchemaObject, { timestamps: true });
