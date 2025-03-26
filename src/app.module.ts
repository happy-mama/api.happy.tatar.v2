import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedirectModule } from "./redirect/redirect.module";
import { FSModule } from "./fs/fs.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || ""),
    RedirectModule,
    FSModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
