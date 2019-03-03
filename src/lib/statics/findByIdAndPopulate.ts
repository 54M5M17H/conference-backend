import { Types } from 'mongoose';

// mongo-server-side populate
export default (configurations: IPopulateConfig[]) => {
	const lookups = configurations.map(config => ({ $lookup: config }));

	return function (id: string) {
		const pipe: any[] = [{ $match: { _id: Types.ObjectId(id), } }, ...lookups];
		return this.aggregate(pipe).exec();
	};
};
