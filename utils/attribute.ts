import { AttributeInfo, Constant, decodeAttributeInfo } from "./class-decoder";
import { getConstant, getString } from "./class-parser";
import { createDecoder, Decoder } from "./decoder";

export interface ConstantValueAttribute {
  type: "constantValue";
  value: Constant & {
    type: "long" | "float" | "double" | "integer" | "stringReference";
  };
}
const decodeConstantValueAttribute = (
  decoder: Decoder,
  constantPool: Constant[]
): ConstantValueAttribute => {
  const index = decoder.getU2();
  const constant = getConstant(constantPool, index);
  if (
    constant.type !== "long" &&
    constant.type !== "float" &&
    constant.type !== "double" &&
    constant.type !== "integer" &&
    constant.type !== "stringReference"
  )
    throw new Error();
  return { type: "constantValue", value: constant };
};

export interface Exception {
  startPC: number;
  endPC: number;
  handlerPC: number;
  catchType: undefined | string[];
}
export interface CodeAttribute {
  type: "code";
  maxStack: number;
  maxLocals: number;
  code: ArrayBuffer;
  exceptionTable: Exception[];
  attributes: Attribute[];
}
const decodeCodeAttribute = (
  decoder: Decoder,
  constantPool: Constant[]
): CodeAttribute => {
  const maxStack = decoder.getU2();
  const maxLocals = decoder.getU2();
  const codeLength = decoder.getU4();
  const code = decoder.getBytes(codeLength);
  const exceptionTableLength = decoder.getU2();
  const exceptionTable: Exception[] = [];
  for (let i = 0; i < exceptionTableLength; i++) {
    const startPC = decoder.getU2();
    const endPC = decoder.getU2();
    const handlerPC = decoder.getU2();
    const catchTypeIndex = decoder.getU2();
    let catchType: string[] | undefined = undefined;
    if (catchTypeIndex !== 0) {
      const classInfoConstant = getConstant(constantPool, catchTypeIndex);
      if (classInfoConstant.type !== "classReference") throw new Error();
      const className = getString(constantPool, classInfoConstant.index);
      catchType = className.split("/");
    }
    exceptionTable.push({ startPC, endPC, handlerPC, catchType });
  }
  const attributeCount = decoder.getU2();
  const attributes: Attribute[] = [];
  for (let i = 0; i < attributeCount; i++) {
    const attributeInfo = decodeAttributeInfo(decoder);
    const attribute = decodeAttribute(attributeInfo, constantPool);
    attributes.push(attribute);
  }
  return {
    type: "code",
    maxStack,
    maxLocals,
    code,
    exceptionTable,
    attributes,
  };
};

type StackMapFrame = "";
export interface StackMapTableAttribute {
  entries: StackMapFrame[];
}

export interface UnknownAttribute {
  type: "Unknown";
  name: string;
  data: ArrayBuffer;
}
export const decodeAttribute = (
  info: AttributeInfo,
  constantPool: Constant[]
): Attribute => {
  const decoder = createDecoder(info.info);
  const name = getString(constantPool, info.nameIndex);
  switch (name) {
    case "ConstantValue":
      return decodeConstantValueAttribute(decoder, constantPool);
    case "Code":
      return decodeCodeAttribute(decoder, constantPool);
    default:
      return { type: "Unknown", name, data: info.info };
  }
};
export type Attribute =
  | ConstantValueAttribute
  | UnknownAttribute
  | CodeAttribute;
