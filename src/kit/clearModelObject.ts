import { Document, Types } from "mongoose";

type fakeModel = Document<unknown, unknown, unknown> & {
  _id: Types.ObjectId;
} & {
  __v: number;
};

export const clearModelObject = <T extends fakeModel>(v: T) => {
  const copy = v.toObject();

  // @ts-expect-error necessary evil
  delete copy._id;

  return copy as T;
};
