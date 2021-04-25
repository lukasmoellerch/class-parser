import { ClassAccessFlags, parseClassAccessFlags } from "./access-flags-class";
import { FieldAccessFlags, parseFieldAccessFlags } from "./access-flags-field";
import {
  MethodAccessFlags,
  parseMethodAccessFlags,
} from "./access-flags-method";
import { createDecoder, Decoder } from "./decoder";

interface ConstantMap {
  "utf-8": { string: string };
  integer: { value: number };
  float: { value: number };
  long: { value: number };
  double: { value: number };
  classReference: { index: number };
  stringReference: { index: number };
  fieldReference: { classIndex: number; nameTypeDescIndex: number };
  methodReference: { classIndex: number; nameTypeDescIndex: number };
  interfaceMethodReference: { classIndex: number; nameTypeDescIndex: number };
  nameTypeDesc: { nameIndex: number; typeDescIndex: number };
  methodHandle: { typeDesc: number; index: number };
  methodType: { index: number };
  dynamic: {};
  invokeDynamic: {};
  module: {};
  package: {};
  unknown: {};
}
export type Constant = {
  [K in keyof ConstantMap]: { type: K } & ConstantMap[K];
}[keyof ConstantMap];
const decodeConstant = (parser: Decoder): Constant => {
  const tagByte = parser.getU1();
  switch (tagByte) {
    case 1:
      const size = parser.getU2();
      const string = parser.getString(size);
      return { type: "utf-8", string };

    case 3:
      return { type: "integer", value: parser.getS4() };

    case 4:
      return { type: "float", value: parser.getF4() };

    case 5:
      return { type: "long", value: parser.getU8() };

    case 6:
      return { type: "double", value: parser.getF8() };

    case 7: {
      const index = parser.getU2();
      return { type: "classReference", index };
    }

    case 8: {
      const index = parser.getU2();
      return { type: "stringReference", index };
    }

    case 9: {
      const classIndex = parser.getU2();
      const nameTypeDescIndex = parser.getU2();
      return {
        type: "fieldReference",
        classIndex,
        nameTypeDescIndex,
      };
    }

    case 10: {
      const classIndex = parser.getU2();
      const nameTypeDescIndex = parser.getU2();
      return {
        type: "methodReference",
        classIndex,
        nameTypeDescIndex,
      };
    }

    case 11: {
      const classIndex = parser.getU2();
      const nameTypeDescIndex = parser.getU2();
      return {
        type: "interfaceMethodReference",
        classIndex,
        nameTypeDescIndex,
      };
    }

    case 12: {
      const nameIndex = parser.getU2();
      const typeDescIndex = parser.getU2();
      return {
        type: "nameTypeDesc",
        nameIndex,
        typeDescIndex,
      };
    }

    case 15: {
      const typeDesc = parser.getU1();
      const index = parser.getU2();
      return { type: "methodHandle", typeDesc, index };
    }

    case 16: {
      const index = parser.getU2();
      return { type: "methodType", index };
    }

    case 17: {
      parser.skip(4);
      return { type: "dynamic" };
    }

    case 18: {
      parser.skip(4);
      return { type: "invokeDynamic" };
    }

    case 19: {
      parser.skip(2);
      return { type: "module" };
    }

    case 19: {
      parser.skip(2);
      return { type: "package" };
    }

    default:
      return { type: "unknown" };
  }
};

export interface AttributeInfo {
  nameIndex: number;
  attributeLength: number;
  info: ArrayBuffer;
}
export const decodeAttributeInfo = (parser: Decoder): AttributeInfo => {
  const attributeNameIndex = parser.getU2();
  const attributeLength = parser.getU4();
  const info = parser.getBytes(attributeLength);
  return {
    nameIndex: attributeNameIndex,
    attributeLength,
    info,
  };
};

interface FieldInfo {
  accessFlags: FieldAccessFlags;
  nameIndex: number;
  descriptorIndex: number;
  attributesCount: number;
  attributes: AttributeInfo[];
}
const decodeFieldInfo = (parser: Decoder): FieldInfo => {
  const accessFlags = parseFieldAccessFlags(parser.getU2());
  const nameIndex = parser.getU2();
  const descriptorIndex = parser.getU2();
  const attributesCount = parser.getU2();
  const attributes = [];
  for (let i = 0; i < attributesCount; i++) {
    attributes.push(decodeAttributeInfo(parser));
  }
  return {
    accessFlags,
    nameIndex,
    descriptorIndex,
    attributesCount,
    attributes,
  };
};

interface MethodInfo {
  accessFlags: MethodAccessFlags;
  nameIndex: number;
  descriptorIndex: number;
  attributesCount: number;
  attributes: AttributeInfo[];
}
const decodeMethodInfo = (parser: Decoder): MethodInfo => {
  const accessFlags = parseMethodAccessFlags(parser.getU2());
  const nameIndex = parser.getU2();
  const descriptorIndex = parser.getU2();
  const attributesCount = parser.getU2();
  const attributes = [];
  for (let i = 0; i < attributesCount; i++) {
    attributes.push(decodeAttributeInfo(parser));
  }
  return {
    accessFlags,
    nameIndex,
    descriptorIndex,
    attributesCount,
    attributes,
  };
};

interface ClassFile {
  magic: number;

  minorVersion: number;
  majorVersion: number;

  constantPoolCount: number;
  constantPool: Constant[];
  accessFlags: ClassAccessFlags;

  thisClassIndex: number;
  superClassIndex: number;

  interfacesCount: number;
  interfaces: number[];

  fieldsCount: number;
  fields: FieldInfo[];

  methodsCount: number;
  methods: MethodInfo[];

  attributesCount: number;
  attributes: AttributeInfo[];
}
export const decodeClass = (data: ArrayBuffer): ClassFile => {
  const parser = createDecoder(data);
  const magic = parser.getU4();

  const minorVersion = parser.getU2();
  const majorVersion = parser.getU2();

  const constantPoolCount = parser.getU2();
  const constantPool: Constant[] = [];
  for (let i = 0; i < constantPoolCount - 1; i++) {
    const constant = decodeConstant(parser);
    constantPool.push(constant);
    if (constant.type === "long" || constant.type === "double") {
      i++;
      constantPool.push({ type: "unknown" });
    }
  }

  const accessFlags = parseClassAccessFlags(parser.getU2());
  const thisClassIndex = parser.getU2();
  const superClassIndex = parser.getU2();

  const interfacesCount = parser.getU2();
  const interfaces: number[] = [];
  for (let i = 0; i < interfacesCount; i++) {
    interfaces.push(parser.getU2());
  }

  const fieldsCount = parser.getU2();
  const fields: FieldInfo[] = [];
  for (let i = 0; i < fieldsCount; i++) {
    fields.push(decodeFieldInfo(parser));
  }

  const methodsCount = parser.getU2();
  const methods: MethodInfo[] = [];
  for (let i = 0; i < methodsCount; i++) {
    methods.push(decodeMethodInfo(parser));
  }

  const attributesCount = parser.getU2();
  const attributes: AttributeInfo[] = [];
  for (let i = 0; i < attributesCount; i++) {
    attributes.push(decodeAttributeInfo(parser));
  }

  return {
    magic,
    minorVersion,
    majorVersion,

    constantPoolCount,
    constantPool,

    accessFlags,
    thisClassIndex,
    superClassIndex,

    interfacesCount,
    interfaces,

    fieldsCount,
    fields,

    methodsCount,
    methods,

    attributesCount,
    attributes,
  };
};
