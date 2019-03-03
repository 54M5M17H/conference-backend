import * as httpErrors from 'http-errors';

export default async function (talkId: string, attendeeId: string): Promise<boolean> {

	const talkSpot = await this.findOneAndUpdate(
		{
			_id: talkId,
			// REST OF QUERY EVALUATES FIRST SO THIS IS ONLY SINGLE MATCHING TALK
			$where: function () {
				// doesnt have closure -- executes on mongo server
				return this.attendees.length < 30; // config.maxAttendance
			}
		},
		{ $addToSet: { attendees: attendeeId } },
		{ new: true }
	).lean();

	if (talkSpot) {
		return true; // got a spot
	}

	const talk = await this.findById(talkId, 'attendees').lean();
	if (!talk) {
		throw new httpErrors.NotFound('That talk does not exist');
	}

	if (!!talk.attendees.find(attendee => attendee.equals(attendeeId))) {
		// already got a spot
		return true;
	}

	// talk is full
	return false;
}
