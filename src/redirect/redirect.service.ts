import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Redirect } from "./redirect.schema";
import { mongooseErrorParser } from "src/kit/error";
import { clearModelObject } from "src/kit/clearModelObject";

@Injectable()
export class RedirectService {
  constructor(
    @InjectModel(Redirect.name) private RedirectModel: Model<Redirect>,
  ) {}

  async findOne(
    key: Redirect["key"],
  ): Promise<GORT<Redirect>["item"] | GORT["error"]> {
    const _redirect = await this.RedirectModel.findOne({ key }, "-_id");

    console.log(">>>GET", key, _redirect);

    if (!_redirect) {
      return {
        type: "error",
        error: "NOTHING_FOUND",
      };
    }

    _redirect.updateOne({}, { $inc: { redirected: "1" } });

    return {
      type: "item",
      item: _redirect,
    };
  }

  async findAll(): Promise<GORT<Redirect>["items"] | GORT["error"]> {
    const _redirects = await this.RedirectModel.find({}, "-_id");

    if (!_redirects || (_redirects && _redirects.length == 0)) {
      return {
        type: "error",
        error: "NOTHING_FOUND",
      };
    }

    return {
      type: "items",
      items: _redirects,
    };
  }

  async createOne(
    body: Redirect,
  ): Promise<GORT<Redirect>["item"] | GORT["error"]> {
    if (!body)
      return {
        type: "error",
        error: "BODY_MISSING",
      };

    const _redirect = new this.RedirectModel({ ...body, redirected: 0 });

    return _redirect
      .save()
      .then(() => ({
        type: "item" as GORT<Redirect>["item"]["type"],
        item: clearModelObject(_redirect),
      }))
      .catch((e) => mongooseErrorParser(e));
  }
}
