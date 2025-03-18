import { HttpStatus } from "@nestjs/common";
import { Response } from "express";

type MongooseError = {
  errors: {
    [key: string]: {
      name: string;
      message: string;
      kind: string;
      path: string;
      value: any;
      properties: {
        message: string;
        type: string;
        path: string;
        value: any;

        [key: string]: any;
      };
    };
  };
  _message: string;
  message: string;
  name: string;
  cause: any;
};

// mongoose error have "any" type too
export const mongooseErrorParser: (e: any) => GORT["error"] = (
  e: MongooseError,
) => {
  if (e.cause) {
    return {
      type: "error",
      message: e.message,
      error: errorCodeParser(e.message),
    };
  } else {
    if (!e)
      return {
        type: "error",
        error: "UNKNOWN",
      };

    if (!e.errors || (e.errors && typeof e.errors != "object"))
      return {
        type: "error",
        error: "UNKNOWN",
      };

    let error: GORT["error"]["error"] = "UNKNOWN";
    let message: GORT["error"]["message"] = "";

    Object.values(e.errors).forEach((err) => {
      message = err.message;

      error = errorCodeParser(message);
    });

    return {
      type: "error",
      error,
      message,
    };
  }
};

const errorCodeParser: (error: string) => GORT["error"]["error"] = (error) => {
  const type = error.split(":")[1];

  if (type.includes("length")) return "PROPERTY_LENGTH_INVALID";

  if (type == "validate") return "PROPERTY_VALIDATE";

  if (type == "unique") return "PROPERTY_UNIQUE";

  if (type == "required") return "PROPERTY_MISSING";

  return "UNKNOWN";
};

export const setResponseStatusCode: (
  res: Response,
  data: GORT["error" | "item" | "items" | "serverStatus" | "success"],
) => void = (res, data) => {
  if (data.type == "error") {
    if (data.error == "NOT_FOUND") {
      res.status(HttpStatus.NOT_FOUND);
    }

    res.status(HttpStatus.BAD_REQUEST);
  }
};
