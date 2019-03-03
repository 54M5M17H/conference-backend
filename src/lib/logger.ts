// THIS IS WHERE YOU MIGHT IMPLEMENT YOUR APM SOLUTION(S)

import * as Debug from 'debug';
const debug = Debug('conference-api/logger');

export const log = (message) => {
	debug(`${new Date().toISOString()}: ${message}`);
};
