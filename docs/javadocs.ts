import { MethodType } from "../utils/method-descriptor-parser";

export const getMethodId = (methodName: string, type: MethodType) => {
  let s = `${methodName}-`;
  let i = 0;
  return s;
};
