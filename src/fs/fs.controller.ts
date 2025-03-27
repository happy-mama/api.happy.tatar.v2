import {
  Controller,
  Get,
  Post,
  Res,
  Headers,
  Query,
  UploadedFile,
  UseInterceptors,
  Delete,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";

import { FSService } from "./fs.service";
import { setResponseStatusCode } from "../kit/error";

@Controller("fs")
export class FSController {
  constructor(private readonly fsService: FSService) {}

  @Get()
  async readDirOrStreamFile(
    @Res({ passthrough: true }) res: Response,
    @Query("dir") dir: string = "",
  ) {
    const data = await this.fsService.readDirOrStreamFile(dir, res);

    if ("type" in data) {
      setResponseStatusCode(res, data);
    }

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
  async mkdirOrUploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
    @Query("dir") dir: string = "",
    @Headers("fs-key") fsKey: string,
  ): Promise<GORT["success" | "error"]> {
    const data = await this.fsService.mkdirOrUploadFile({ dir, file, fsKey });

    setResponseStatusCode(res, data);

    return data;
  }

  @Delete()
  async removeDirOrFile(
    @Res({ passthrough: true }) res: Response,
    @Query("dir") dir: string = "",
    @Headers("fs-key") fsKey: string,
  ) {
    const data = await this.fsService.removeDirOrFile(dir, fsKey);

    setResponseStatusCode(res, data);

    return data;
  }
}
