import * as mongoose from 'mongoose';

import config from '../../config';
import findByIdAndPopulate from '../../lib/statics/findByIdAndPopulate';
import rsvpIfSpace from '../../lib/statics/rsvpIfSpace';
import talksSchema from './talks.schema';
import talksPopulateConfig from './talksPopulateConfig';

talksSchema.statics.findByIdAndPopulate = findByIdAndPopulate(talksPopulateConfig);
talksSchema.statics.rsvpIfSpace = rsvpIfSpace;

talksSchema.index({ attendees: 1 });

talksSchema.post('find', (docs: any) => {
	docs.forEach(populateSpacesLeft);
	return docs;
});

talksSchema.post('findOne', (doc: any) => {
	populateSpacesLeft(doc);
	return doc;
});

const populateSpacesLeft = (talk) => {
	if (!talk) {
		return;
	}
	talk.spacesLeft = config.maxAttendance - talk.attendees.length;
};

export default mongoose.model('Talk', talksSchema, 'talks') as TExtendedModel;

type TExtendedModel = mongoose.Model<any> & { findByIdAndPopulate } & { rsvpIfSpace };
