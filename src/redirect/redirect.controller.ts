import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import { Response } from "express";

import { RedirectService } from "./redirect.service";
import { Redirect } from "./redirect.schema";
import { setResponseStatusCode } from "../kit/error";

@Controller("t")
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get("all")
  async getAll() {
    return this.redirectService.findAll();
  }

  @Get(":key")
  async getOne(@Param("key") key: string) {
    return this.redirectService.findOne(key);
  }

  @Post()
  async createOne(
    @Body() body: Redirect,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.redirectService.createOne(body);

    setResponseStatusCode(res, data);

    return data;
  }

  @Delete(":key")
  async deleteOne(
    @Param("key") key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.redirectService.deleteOne(key);

    setResponseStatusCode(res, data);

    return data;
  }
}
