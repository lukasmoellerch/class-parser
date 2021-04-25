import { StringParser } from "./string-parser";

export const parseFieldDescriptor = (parser: StringParser) => {
  return parseFieldType(parser);
};
export type FieldType =
  | "void"
  | "byte"
  | "char"
  | "double"
  | "float"
  | "int"
  | "long"
  | "short"
  | "boolean"
  | { type: "reference"; className: string[] }
  | { type: "array"; componentType: FieldType };

export const parseFieldType = (parser: StringParser): FieldType => {
  const term = parser.peek();
  parser.advance();
  switch (term) {
    case "B":
      return "byte";
    case "C":
      return "char";
    case "D":
      return "double";
    case "F":
      return "float";
    case "I":
      return "int";
    case "J":
      return "long";
    case "L": {
      const className = parser.readUntil(";").split("/");
      parser.advance();
      return { type: "reference", className };
    }
    case "S":
      return "short";
    case "Z":
      return "boolean";
    case "[": {
      const componentType = parseFieldType(parser);
      return { type: "array", componentType };
    }
  }
  return "void";
};
