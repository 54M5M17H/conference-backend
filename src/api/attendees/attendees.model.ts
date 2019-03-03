import * as mongoose from 'mongoose';
import findByIdAndPopulate from '../../lib/statics/findByIdAndPopulate';
import attendeesSchema from './attendees.schema';
import attendeesPopulateConfig from './attendeesPopulateConfig';

attendeesSchema.statics.findByIdAndPopulate = findByIdAndPopulate(attendeesPopulateConfig);
attendeesSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('Attendee', attendeesSchema, 'attendees') as TExtendedModel;

type TExtendedModel = mongoose.Model<any> & { findByIdAndPopulate };
