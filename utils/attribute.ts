import { AttributeInfo, Constant, decodeAttributeInfo } from "./class-decoder";
import { getConstant, getString } from "./class-parser";
import { createDecoder, Decoder } from "./decoder";
import { FieldType, parseFieldDescriptor } from "./field-descriptor-parser";
import { createStringParser } from "./string-parser";

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

export interface LocalVariableInfo {
  startPC: number;
  length: number;
  name: string;
  type: FieldType;
  index: number;
}

export interface LocalVariableTableAttribute {
  type: "localVariableTable";
  localVariableTable: LocalVariableInfo[];
}

const decodeLocalVariableInfoAttribute = (
  decoder: Decoder,
  constantPool: Constant[]
): LocalVariableTableAttribute => {
  const localVariableTableLength = decoder.getU2();
  const localVariableTable: LocalVariableInfo[] = [];
  for (let i = 0; i < localVariableTableLength; i++) {
    const startPC = decoder.getU2();
    const length = decoder.getU2();
    const nameIndex = decoder.getU2();
    const name = getString(constantPool, nameIndex);
    const descriptorIndex = decoder.getU2();
    const type = parseFieldDescriptor(
      createStringParser(getString(constantPool, descriptorIndex))
    );
    const index = decoder.getU2();
    localVariableTable.push({ startPC, length, name, type, index });
  }
  return { type: "localVariableTable", localVariableTable };
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
    case "LocalVariableTable":
      return decodeLocalVariableInfoAttribute(decoder, constantPool);
    default:
      return { type: "Unknown", name, data: info.info };
  }
};
export type Attribute =
  | ConstantValueAttribute
  | LocalVariableTableAttribute
  | UnknownAttribute
  | CodeAttribute;
