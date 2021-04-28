import {
  CodeAttribute,
  decodeAttribute,
  LocalVariableInfo,
  LocalVariableTableAttribute,
} from "./attribute";
import { Constant, decodeClass } from "./class-decoder";
import { createDecoder } from "./decoder";
import { disassembler, Instruction } from "./disassembler";
import { FieldType, parseFieldDescriptor } from "./field-descriptor-parser";
import { MethodType, parseMethodDescriptor } from "./method-descriptor-parser";
import { createStringParser } from "./string-parser";

export const getConstant = (constants: Constant[], index: number) =>
  constants[index - 1];

export const getString = (constants: Constant[], index: number) => {
  const stringConstant = getConstant(constants, index);
  if (stringConstant.type !== "utf-8") throw new Error();
  const str = stringConstant.string;
  return str;
};

export const getClassReference = (constants: Constant[], index: number) => {
  const classReference = getConstant(constants, index);
  if (classReference.type !== "classReference") throw new Error();
  return getString(constants, classReference.index).split("/");
};

export const getNameTypeDesc = (constants: Constant[], index: number) => {
  const nameTypeDesc = getConstant(constants, index);
  if (nameTypeDesc.type !== "nameTypeDesc") throw new Error();
  const name = getString(constants, nameTypeDesc.nameIndex);
  const typeDesc = getString(constants, nameTypeDesc.typeDescIndex);
  return {
    name,
    type: typeDesc.startsWith("(")
      ? parseMethodDescriptor(createStringParser(typeDesc))
      : parseFieldDescriptor(createStringParser(typeDesc)),
  };
};

export const getMethodReference = (constants: Constant[], index: number) => {
  const methodReference = getConstant(constants, index);
  if (methodReference.type !== "methodReference") throw new Error();
  const classRef = getClassReference(constants, methodReference.classIndex);
  const nameType = getNameTypeDesc(
    constants,
    methodReference.nameTypeDescIndex
  ) as ReturnType<typeof getNameTypeDesc> & { type: MethodType };
  return { classRef, nameType };
};
export const getFieldReference = (constants: Constant[], index: number) => {
  const fieldReference = getConstant(constants, index);
  if (fieldReference.type !== "fieldReference") throw new Error();
  const classRef = getClassReference(constants, fieldReference.classIndex);
  const nameType = getNameTypeDesc(
    constants,
    fieldReference.nameTypeDescIndex
  ) as ReturnType<typeof getNameTypeDesc> & { type: FieldType };
  return { classRef, nameType };
};

export const parseClass = (data: ArrayBuffer) => {
  const decoded = decodeClass(data);
  const constants = decoded.constantPool;

  const majorVersion = decoded.majorVersion;
  const minorVersion = decoded.minorVersion;

  const thisClass = getClassReference(constants, decoded.thisClassIndex);
  const superClass = getClassReference(constants, decoded.superClassIndex);
  const accessFlags = decoded.accessFlags;
  const interfaces = decoded.interfaces.map((x) =>
    getClassReference(constants, x)
  );
  const fields = decoded.fields.map((field) => {
    const accessFlags = field.accessFlags;
    const name = getString(constants, field.nameIndex);
    const descriptor = parseFieldDescriptor(
      createStringParser(getString(constants, field.descriptorIndex))
    );
    const attributes = field.attributes.map((attribute) =>
      decodeAttribute(attribute, constants)
    );
    return { accessFlags, name, descriptor, attributes };
  });
  const methods = decoded.methods.map((method) => {
    const accessFlags = method.accessFlags;
    const name = getString(constants, method.nameIndex);
    const descriptor = parseMethodDescriptor(
      createStringParser(getString(constants, method.descriptorIndex))
    );
    const attributes = method.attributes.map((attribute) =>
      decodeAttribute(attribute, constants)
    );
    const codeAttribute = attributes.find(
      (x) => x.type === "code"
    ) as CodeAttribute;
    let instructions: Instruction[] = [];
    let localVariableData: Record<number, LocalVariableInfo> = {};
    if (codeAttribute !== undefined) {
      instructions = disassembler(createDecoder(codeAttribute.code), constants);
      const localVariableTableAttribute = codeAttribute.attributes.find(
        (x) => x.type === "localVariableTable"
      ) as LocalVariableTableAttribute;
      if (localVariableTableAttribute !== undefined) {
        for (let variable of localVariableTableAttribute.localVariableTable) {
          localVariableData[variable.index] = variable;
        }
      } else {
        let index = 0;
        if (!method.accessFlags.isStatic) {
          localVariableData[index++] = {
            index: 0,
            startPC: 0,
            length: codeAttribute.code.byteLength,
            name: "this",
            type: { type: "reference", className: thisClass },
          };
        }
        let parameterIndex = 0;
        for (let parameter of descriptor.parameterTypes) {
          localVariableData[index++] = {
            index,
            startPC: 0,
            length: codeAttribute.code.byteLength,
            name: `arg${parameterIndex++}`,
            type: parameter,
          };
        }
      }
    }
    return {
      accessFlags,
      name,
      descriptor,
      attributes,
      instructions,
      localVariableData,
    };
  });

  const attributes = decoded.attributes.map((attribute) =>
    decodeAttribute(attribute, constants)
  );

  return {
    majorVersion,
    minorVersion,
    thisClass,
    superClass,
    accessFlags,
    interfaces,
    fields,
    methods,
    attributes,
    constants,
  };
};

export type Method = ReturnType<typeof parseClass>["methods"][number];
export type Field = ReturnType<typeof parseClass>["fields"][number];
