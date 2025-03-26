import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

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

  async getFiles(dir: string): Promise<GORT<FSFile>["items" | "error"]> {
    const safeDir = this.validatePath(dir);

    if (typeof safeDir != "string") {
      return safeDir;
    }

    return fs.promises
      .readdir(safeDir, { withFileTypes: true })
      .then((data) => ({
        type: "items" as GORT["items"]["type"],
        items: data.map((v) => ({
          name: v.name,
          type: v.isDirectory() ? "dir" : ("file" as FSFile["type"]),
        })),
      }))
      .catch((e) => fsErrorParser(e));
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

  async uploadFile({
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
}
