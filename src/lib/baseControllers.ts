import * as httpError from 'http-errors';
import { Document, Model } from 'mongoose';

export const models: Record<TResource|string, Model<any>> = {};

export const initialiseController = <T>(modelName: TResource, model: Model<Document>) => {
	models[modelName] = model;
	return {
		findById: findById<T>(modelName),
		list: list<T>(modelName),
		create: create<T>(modelName),
		patch: patch<T>(modelName)
	};
};

export const findById = <T>(modelName: TResource) => async (resourceId: string): Promise<T> => {
	const resource: T = await models[modelName].findById(resourceId).lean();
	if (!resource) {
		throw new httpError.NotFound(`Couldn\'t find that ${modelName}.`);
	}
	return resource;
};

export const list = <T>(modelName: TResource) => async (options: IListOptions = {}): Promise<T[]> => {
	const limit = configureLimit(options.pageSize);
	const skip = limit * (options.page - 1 || 0);
	return models[modelName].find({}).limit(limit).skip(skip).lean();
};

export const create = <T>(modelName: TResource) => (data: Partial<T>): Promise<T> => {
	return models[modelName].create(data);
};

export const patch = <T>(modelName: TResource) => async (id: string, data: Partial<T>): Promise<T> => {
	const patchedResource = await models[modelName].findByIdAndUpdate(
		id, { $set: data }, { runValidators: true, new: true }
	).lean();
	if (!patchedResource) {
		throw new httpError.NotFound(`Couldn\'t find that ${modelName}.`);
	}
	return patchedResource;
};

const configureLimit = (limit: number = 10) => {
	if (limit > 100) {
		return 100;
	}
	return Number(limit);
};
