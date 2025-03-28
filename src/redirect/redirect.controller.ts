import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
} from "@nestjs/common";
import { Response } from "express";

import { RedirectService } from "./redirect.service";
import { Redirect } from "./redirect.schema";
import { setResponseStatusCode } from "../kit/error";

@Controller("r")
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Get("all")
  async getAll(@Res({ passthrough: true }) res: Response) {
    const data = await this.redirectService.findAll();

    setResponseStatusCode(res, data);

    return data;
  }

  @Get(":key")
  async getOne(
    @Res({ passthrough: true }) res: Response,
    @Param("key") key: string,
    @Query("notCount") notCount: string,
  ) {
    const data = await this.redirectService.findOne(key, Boolean(notCount));

    setResponseStatusCode(res, data);

    return data;
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
