import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type RedirectDocument = HydratedDocument<Redirect>;

const URL_REGEX =
  // eslint-disable-next-line no-useless-escape
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

@Schema({
  versionKey: false,
})
export class Redirect {
  @Prop({
    required: [true, "url:required:true"],
    minlength: [10, "url:minlength:{MINLENGTH}"],
    validate: [URL_REGEX, "url:validate:URL"],
  })
  url: string;

  @Prop({
    required: [true, "key:required:true"],
    minlength: [1, "key:minlength:{MINLENGTH}"],
    maxlength: [20, "key:maxlength:{MAXLENGTH}"],
    unique: [true, "key:unique:true"],
  })
  key: string;

  @Prop({ default: 0 })
  redirected: number;
}

export const RedirectSchema = SchemaFactory.createForClass(Redirect);
