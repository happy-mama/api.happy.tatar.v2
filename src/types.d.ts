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
      | "BODY_MISSING"
      | "BODY_INVALID"
      | "PROPERTY_TYPE_INVALID"
      | "PROPERTY_LENGTH_INVALID"
      | "PROPERTY_VALIDATE"
      | "PROPERTY_UNIQUE"
      | "NOTHING_FOUND";
    message?: string;
  };
  item: {
    type: "item";
    item: T;
  };
  items: {
    type: "items";
    items: T[];
  };
}
