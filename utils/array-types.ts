const T_BOOLEAN = 4;
const T_CHAR = 5;
const T_FLOAT = 6;
const T_DOUBLE = 7;
const T_BYTE = 8;
const T_SHORT = 9;
const T_INT = 10;
const T_LONG = 11;

export type ArrayType =
  | "boolean"
  | "char"
  | "float"
  | "double"
  | "byte"
  | "short"
  | "int"
  | "long";

export const parseArrayType = (arrayType: number): ArrayType => {
  if (arrayType === T_BOOLEAN) return "boolean";
  if (arrayType === T_CHAR) return "char";
  if (arrayType === T_FLOAT) return "float";
  if (arrayType === T_DOUBLE) return "double";
  if (arrayType === T_BYTE) return "byte";
  if (arrayType === T_SHORT) return "short";
  if (arrayType === T_INT) return "int";
  if (arrayType === T_LONG) return "long";
  throw new Error();
};
