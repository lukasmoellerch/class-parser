import React from "react";
import { Constant } from "../utils/class-decoder";
import {
  getClassReference,
  getConstant,
  getFieldReference,
  getMethodReference,
} from "../utils/class-parser";
import { Instruction, InstructionDataField } from "../utils/disassembler";
import ClassPath from "./ClassPath";
import FieldTypeComponent from "./FieldType";
import MethodTypeComponent from "./MethodType";

interface FieldProps {
  field: InstructionDataField;
  constants: Constant[];
  instruction: Instruction;
}
const FieldComponent: React.FC<FieldProps> = ({
  field,
  constants,
  instruction,
}) => {
  if (typeof field.type !== "string") {
    return <>{JSON.stringify(field)}</>;
  }
  if (field.type === "offset") {
    return (
      <>
        {instruction.offset + field.value}{" "}
        <span className="opacity-70">
          ({field.value > 0 ? `+${field.value}` : field.value})
        </span>
      </>
    );
  }
  if (field.type === "localIndex") {
    return <span className="text-red-500 font-bold">%{field.value}</span>;
  }
  if (field.type === "typeIndex") {
    const t = getClassReference(constants, field.value);
    return <ClassPath path={t} />;
  }
  if (field.type === "intLiteral") {
    return <>{field.value}</>;
  }
  if (field.type === "fieldReference") {
    const t = getFieldReference(constants, field.value);
    return (
      <>
        <FieldTypeComponent type={t.nameType.type} /> {t.classRef.join(".")}.
        {t.nameType.name}
      </>
    );
  }
  if (field.type === "methodReference") {
    const t = getMethodReference(constants, field.value);
    const href = t.classRef[0] === "java" ? `` : undefined;
    return (
      <>
        <MethodTypeComponent type={t.nameType.type} name={t.nameType.name} />{" "}
        <ClassPath path={t.classRef} />
      </>
    );
  }
  if (field.type === "constantReference") {
    try {
      const t = getConstant(constants, field.value);
      if (
        t.type !== "integer" &&
        t.type !== "long" &&
        t.type !== "float" &&
        t.type !== "double"
      )
        return null;
      return <>{t.value}</>;
    } catch (e) {
      return <>{field.value}</>;
    }
  }
  return null;
};

interface Props {
  data: Instruction["data"] & {};
  constants: Constant[];
  instruction: Instruction;
}

const InstructionDataComponent: React.FC<Props> = ({
  data,
  constants,
  instruction,
}) => {
  let elements: React.ReactChild[] = [];

  let first = true;
  let i = 0;
  for (const [key, value] of Object.entries(data)) {
    if (first) {
      first = false;
    } else {
      elements.push(<span key={`,${i}`}>, </span>);
    }
    elements.push(
      <span
        key={`k${i}`}
        className="text-yellow-500 text-opacity-50 hover:text-opacity-100"
      >
        {key}:{" "}
      </span>
    );
    elements.push(
      <FieldComponent
        instruction={instruction}
        constants={constants}
        field={value}
        key={`p${i}`}
      />
    );
  }

  return <>{elements}</>;
};

export default InstructionDataComponent;
