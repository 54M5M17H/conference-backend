import * as mongoose from 'mongoose';
import speakersSchema from './speakers.schema';

export default mongoose.model('Speaker', speakersSchema, 'speakers');
