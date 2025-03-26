import {
  Controller,
  Get,
  Post,
  Res,
  Headers,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

import { FSService } from "./fs.service";
import { setResponseStatusCode } from "../kit/error";

@Controller("fs")
export class FSController {
  constructor(private readonly fsService: FSService) {}

  @Get()
  async getFiles(
    @Query("dir") dir: string = "",
    @Res({ passthrough: true }) res: Response,
  ): Promise<GORT<FSFile>["items" | "error"]> {
    const data = await this.fsService.getFiles(dir);

    setResponseStatusCode(res, data);

    return data;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fieldNameSize: 100, fileSize: 8589934592 },
      fileFilter(req: { headers: { ["fs-key"]: string } }, file, callback) {
        // in theory, I should pass the error as the first parameter
        // to the callback, but instead of an error in the response,
        // it just crashes the application
        if (!req.headers) return callback(null, false);

        if (!req.headers["fs-key"]) return callback(null, false);

        if (req.headers["fs-key"] != process.env.FS_KEY)
          return callback(null, false);

        callback(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
    @Query("dir") dir: string = "",
    @Headers("fs-key") fsKey: string,
  ): Promise<GORT["success" | "error"]> {
    const data = await this.fsService.uploadFile({ dir, file, fsKey });

    setResponseStatusCode(res, data);

    return data;
  }
}
