import { Schema } from 'mongoose';

const urlRegex = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

const speakersSchema = {
	name: {
		first: { type: String, required: true },
		last: { type: String, required: true },
	},
	photo: {
		type: String,
		required: true,
		validate: {
			validator: (val) => urlRegex.test(val),
			message: 'Invalid URL'
		}
	},
	bio: { type: String, required: true }
};

export default new Schema(speakersSchema, { timestamps: true });
