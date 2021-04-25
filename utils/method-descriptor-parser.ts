import { FieldType, parseFieldDescriptor } from "./field-descriptor-parser";
import { StringParser } from "./string-parser";

export interface MethodType {
  parameterTypes: FieldType[];
  returnType: FieldType;
}
export const parseMethodDescriptor = (parser: StringParser): MethodType => {
  parser.advance();
  const parameterTypes = [];
  while (parser.peek() !== ")" && !parser.eof()) {
    parameterTypes.push(parseFieldDescriptor(parser));
  }
  parser.advance();
  const returnType = parseFieldDescriptor(parser);
  return {
    parameterTypes,
    returnType,
  };
};
