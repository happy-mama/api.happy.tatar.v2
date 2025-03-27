import { Injectable, StreamableFile } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { Response } from "express";

import { fsErrorParser } from "../kit/error";

@Injectable()
export class FSService {
  private readonly publicDir = path.resolve(__dirname, "../../public");
  private readonly maxSubdirs = 6;

  private countSubdirectories(targetPath: string): number {
    const baseParts = path
      .normalize(this.publicDir)
      .split(path.sep)
      .filter(Boolean);
    const targetParts = path
      .normalize(targetPath)
      .split(path.sep)
      .filter(Boolean);

    return targetParts.length - baseParts.length;
  }

  private validatePath(dir: string): string | GORT["error"] {
    const resolvedPath = path.resolve(this.publicDir, dir);

    if (!resolvedPath.startsWith(this.publicDir)) {
      return {
        type: "error",
        error: "DIRECTORY_TRAVERSAL",
        message: ":)",
      };
    }

    if (this.countSubdirectories(resolvedPath) > this.maxSubdirs) {
      return {
        type: "error",
        error: "PARAMETER_INVALID",
        message: "dir:maxSubdirs:6",
      };
    }

    return resolvedPath;
  }

  private streamFile(
    safeDir: string,
    res: Response,
  ): GORT["error"] | StreamableFile {
    try {
      const x = safeDir.split(path.sep);
      const filename = x[x.length - 1];

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Type", "application/octet-stream");

      const fileStream = fs.createReadStream(safeDir);

      return new StreamableFile(fileStream);
    } catch {
      return {
        type: "error",
        error: "UNKNOWN",
      };
    }
  }

  private writeFile = (
    filePath: string,
    buffer: Express.Multer.File["buffer"],
  ): Promise<GORT["success" | "error"]> => {
    return fs.promises
      .writeFile(filePath, buffer)
      .then(() => ({
        type: "success" as GORT["success"]["type"],
      }))
      .catch((e) => fsErrorParser(e));
  };

  private mkdirAndWriteFile = (
    dir: string,
    filePath: string,
    buffer: Express.Multer.File["buffer"],
  ): Promise<GORT["success" | "error"]> => {
    return fs.promises
      .mkdir(dir, { recursive: true })
      .then(() => this.writeFile(filePath, buffer))
      .catch((e) => fsErrorParser(e));
  };

  async readDirOrStreamFile(
    dir: string,
    res: Response,
  ): Promise<GORT<FSFile>["items" | "error"] | StreamableFile> {
    const safeDir = this.validatePath(dir);

    if (typeof safeDir != "string") {
      return safeDir;
    }

    return fs.promises
      .stat(safeDir)
      .then(async (data) => {
        if (data.isDirectory()) {
          return await fs.promises
            .readdir(safeDir, { withFileTypes: true })
            .then(
              (data) =>
                ({
                  type: "items",
                  items: data.map((v) => ({
                    name: v.name,
                    type: v.isDirectory() ? "dir" : "file",
                  })),
                }) as GORT<FSFile>["items"],
            )
            .catch((e) => fsErrorParser(e));
        }
        if (data.isFile()) {
          return this.streamFile(safeDir, res);
        }

        return {
          type: "error",
          error: "UNKNOWN",
        } as GORT["error"];
      })
      .catch((e) => fsErrorParser(e));
  }

  async mkdirOrUploadFile({
    dir,
    file,
    fsKey,
  }: {
    dir: string;
    file: Express.Multer.File;
    fsKey: string;
  }): Promise<GORT["success" | "error"]> {
    if (!fsKey) {
      return {
        type: "error",
        error: "HEADER_MISSING",
        message: "fs-key:required:secret",
      };
    }

    if (fsKey != process.env.FS_KEY) {
      return {
        type: "error",
        error: "HEADER_INVALID",
        message: "fs-key:invalid:secret",
      };
    }

    const safeDir = this.validatePath(dir);

    if (typeof safeDir != "string") {
      return safeDir;
    }

    if (!file) {
      return fs.promises
        .mkdir(safeDir)
        .then(
          () =>
            ({
              type: "success",
            }) as GORT["success"],
        )
        .catch((e) => fsErrorParser(e));
    }

    const filePath = path.join(safeDir, file.originalname);

    return fs.promises
      .stat(safeDir)
      .then((data) => {
        if (data.isDirectory()) {
          return this.writeFile(filePath, file.buffer);
        } else {
          return this.mkdirAndWriteFile(safeDir, filePath, file.buffer);
        }
      })
      .catch((e) => {
        const error = fsErrorParser(e);

        if (error.error == "NO_SUCH_FILE_OR_DIRECTORY")
          return this.mkdirAndWriteFile(safeDir, filePath, file.buffer);

        return error;
      });
  }

  async removeDirOrFile(
    dir: string,
    fsKey: string,
  ): Promise<GORT["success" | "error"]> {
    if (!fsKey) {
      return {
        type: "error",
        error: "HEADER_MISSING",
        message: "fs-key:required:secret",
      };
    }

    if (fsKey != process.env.FS_KEY) {
      return {
        type: "error",
        error: "HEADER_INVALID",
        message: "fs-key:invalid:secret",
      };
    }

    const safeDir = this.validatePath(dir);

    if (typeof safeDir != "string") {
      return safeDir;
    }

    if (safeDir == this.publicDir)
      return {
        type: "error",
        error: "PARAMETER_INVALID",
        message: "dir:equals:publicDir",
      };

    // quite dangerous, I know
    // F to my server if I made a mistake somewhere
    return fs.promises
      .rm(safeDir, { recursive: true })
      .then(
        () =>
          ({
            type: "success",
          }) as GORT["success"],
      )
      .catch((e) => fsErrorParser(e));
  }
}
