import { Schema } from 'mongoose';

const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const schema = {
	name: { type: String },
	email: {
		type: String,
		required: true,
		validate: {
			validator: (val) => emailRegex.test(val),
			message: 'Invalid email address'
		}
	}
};

export default new Schema(schema, { timestamps: true });
