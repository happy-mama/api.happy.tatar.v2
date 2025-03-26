import { Module } from "@nestjs/common";
// import { MulterModule } from "@nestjs/platform-express";
// import { diskStorage } from "multer";

import { FSController } from "./fs.controller";
import { FSService } from "./fs.service";

@Module({
  controllers: [FSController],
  providers: [FSService],
})
export class FSModule {}
