import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { RedirectService } from "./redirect.service";
import { Redirect } from "./redirect.schema";

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
  async createOne(@Body() body: Redirect) {
    return this.redirectService.createOne(body);
  }
}
