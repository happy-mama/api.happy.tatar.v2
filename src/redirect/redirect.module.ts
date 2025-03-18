import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Redirect, RedirectSchema } from "../redirect/redirect.schema";
import { RedirectController } from "./redirect.controller";
import { RedirectService } from "./redirect.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Redirect.name, schema: RedirectSchema },
    ]),
  ],
  controllers: [RedirectController],
  providers: [RedirectService],
})
export class RedirectModule {}
