import 'mocha';
import 'should';

// force mongo to test db
process.env.MONGO_STRING = 'mongodb://localhost:27017/conference-tests';
