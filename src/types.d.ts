/**
 * Generic Output Request Type
 */
interface GORT<T = any> {
  error: {
    type: "error";
    error:
      | "UNKNOWN"
      | "HEADER_MISSING"
      | "HEADER_INVALID"
      | "PARAMETER_MISSING"
      | "PARAMETER_INVALID"
      | "BODY_MISSING"
      | "BODY_INVALID"
      | "PROPERTY_TYPE_INVALID"
      | "PROPERTY_LENGTH_INVALID"
      | "PROPERTY_VALIDATE"
      | "PROPERTY_UNIQUE"
      | "PROPERTY_MISSING"
      | "DIRECTORY_TRAVERSAL"
      | "NO_SUCH_FILE_OR_DIRECTORY"
      | "FILE_OR_DIR_ALREADY_EXISTS"
      | "PATH_NOT_A_FILE"
      | "PATH_NOT_A_DIR"
      | "NOT_FOUND";
    message?: string;
  };
  success: {
    type: "success";
  };
  item: {
    type: "item";
    item: T;
  };
  items: {
    type: "items";
    items: T[];
  };
  serverStatus: {
    type: "serverStatus";
    serverStatus: {
      platform: string;
      freeMem: string;
      totalMem: string;
      cpuThreads: number;
      cpuName: string;
      cpuSpeed: string;
    };
  };
}
