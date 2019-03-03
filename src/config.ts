export default {
	mongoConnectionString: process.env.MONGO_STRING || 'mongodb://localhost:27017/conference',
	maxAttendance: Number(process.env.MAX_ATTENDANCE) || 30
};
