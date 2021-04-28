import { FieldType } from "../utils/field-descriptor-parser";
import { MethodType } from "../utils/method-descriptor-parser";

const serializeType = (type: FieldType) => {
  if (typeof type === "string") {
    return type;
  }
};

export const getMethodId = (methodName: string, type: MethodType) => {
  let s = `${methodName}-`;
  let i = 0;
  for (let t of type.parameterTypes) {
    s += serializeType(t) + "-";
  }
  return s;
};
