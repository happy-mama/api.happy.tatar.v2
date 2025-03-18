import shortUUID from "short-uuid";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

import { Redirect } from "./redirect.schema";
import { clearModelObject } from "../kit/clearModelObject";
import { mongooseErrorParser } from "../kit/error";

@Injectable()
export class RedirectService {
  constructor(
    @InjectModel(Redirect.name) private RedirectModel: Model<Redirect>,
  ) {}

  async findOne(
    key: Redirect["key"],
  ): Promise<GORT<Redirect>["item" | "error"]> {
    const _redirect = await this.RedirectModel.findOne({ key });

    if (!_redirect) {
      return {
        type: "error",
        error: "NOT_FOUND",
      };
    }

    await _redirect.updateOne({ $inc: { redirected: 1 } }).exec();
    _redirect.redirected++;

    return {
      type: "item",
      item: clearModelObject(_redirect),
    };
  }

  async findAll(): Promise<GORT<Redirect>["items" | "error"]> {
    const _redirects = await this.RedirectModel.find({}, "-_id", { limit: 50 });

    if (!_redirects || (_redirects && _redirects.length == 0)) {
      return {
        type: "error",
        error: "NOT_FOUND",
      };
    }

    return {
      type: "items",
      items: _redirects,
    };
  }

  async createOne(body: Redirect): Promise<GORT<Redirect>["item" | "error"]> {
    if (!body) {
      return {
        type: "error",
        error: "BODY_MISSING",
      };
    }

    if (!body.key) {
      body.key = shortUUID.generate();
    }

    const _redirect = new this.RedirectModel({ ...body, redirected: 0 });

    return _redirect
      .save()
      .then(() => ({
        type: "item" as GORT<Redirect>["item"]["type"],
        item: clearModelObject(_redirect),
      }))
      .catch((e) => mongooseErrorParser(e));
  }

  async deleteOne(key: string): Promise<GORT["success" | "error"]> {
    return this.RedirectModel.deleteOne({ key })
      .then(() => ({
        type: "success" as GORT["success"]["type"],
      }))
      .catch((e) => mongooseErrorParser(e));
  }
}
