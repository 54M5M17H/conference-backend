import * as baseController from '../../lib/baseControllers';
import speakersModel from './speakers.model';

const baseMethods = baseController.initialiseController<ISpeaker>('speaker', speakersModel);

export const findById = baseMethods.findById;
export const list = baseMethods.list;
export const create = baseMethods.create;
export const patch = baseMethods.patch;
