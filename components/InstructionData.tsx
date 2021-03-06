import React from "react";
import { useQuery } from "react-query";
import { Constant } from "../utils/class-decoder";
import {
  getCallSiteReference,
  getClassReference,
  getConstant,
  getFieldReference,
  getMethodReference,
  getString,
  Method,
} from "../utils/class-parser";
import { Instruction, InstructionDataField } from "../utils/disassembler";
import { InstructionData } from "../utils/instruction-data";
import ClassPath from "./ClassPath";
import FieldTypeComponent from "./FieldType";
import Identifier from "./Identifier";
import MethodTypeComponent from "./MethodType";

interface FieldProps {
  field: InstructionDataField;
  constants: Constant[];
  method: Method;
  instruction: Instruction;
  fieldName: string;
}
const FieldComponent: React.FC<FieldProps> = ({
  field,
  constants,
  method,
  instruction,
  fieldName,
}) => {
  let content: React.ReactChild = null;
  const locals = method.localVariableData;
  if (typeof field.type !== "string") {
    content = <>{JSON.stringify(field)}</>;
  } else if (field.type === "offset") {
    content = (
      <>
        {instruction.offset + field.value}{" "}
        <span className="opacity-70">
          ({field.value > 0 ? `+${field.value}` : field.value})
        </span>
      </>
    );
  } else if (field.type === "localIndex") {
    const localDebugData = locals[field.value];
    if (localDebugData !== undefined) {
      content = (
        <>
          <Identifier>{localDebugData.name}</Identifier>
          <sup className="text-yellow-300 text-opacity-80 p-0.5">
            {field.value}
          </sup>
        </>
      );
    } else {
      content = <span className="text-red-500 font-bold">%{field.value}</span>;
    }
  } else if (field.type === "typeIndex") {
    const t = getClassReference(constants, field.value);
    content = <ClassPath path={t} />;
  } else if (field.type === "intLiteral") {
    content = <>{field.value}</>;
  } else if (field.type === "fieldReference") {
    const t = getFieldReference(constants, field.value);
    content = (
      <>
        <FieldTypeComponent type={t.nameType.type} />{" "}
        <ClassPath path={t.classRef} />
        <wbr />.<Identifier>{t.nameType.name}</Identifier>
      </>
    );
  } else if (field.type === "methodReference") {
    const t = getMethodReference(constants, field.value);
    content = (
      <>
        <MethodTypeComponent
          type={t.nameType.type}
          name={
            <>
              <ClassPath path={t.classRef} />
              <wbr />.<Identifier>{t.nameType.name}</Identifier>
            </>
          }
        />{" "}
      </>
    );
  } else if (field.type === "constantReference") {
    try {
      const t = getConstant(constants, field.value);
      if (t.type === "stringReference") {
        const s = getString(constants, t.index);
        content = <span className="text-green-400">{JSON.stringify(s)}</span>;
      } else if (
        t.type !== "integer" &&
        t.type !== "long" &&
        t.type !== "float" &&
        t.type !== "double"
      )
        content = null;
      else {
        content = <span className="text-yellow-500">{t.value}</span>;
      }
    } catch (e) {
      content = <>{field.value}</>;
    }
  } else if (field.type === "primitiveType") {
    content = <span className="text-purple-300">{field.name}</span>;
  } else if (field.type === "callSiteReference") {
    const t = getCallSiteReference(constants, field.value);

    content = (
      <>
        <MethodTypeComponent
          type={t.nameType.type}
          name={
            <>
              <Identifier>{t.nameType.name}</Identifier>
            </>
          }
        />{" "}
      </>
    );
  }

  return (
    <>
      {!field.labelHidden && (
        <span className="text-yellow-500 text-opacity-100 hover:text-opacity-100">
          {fieldName}:{" "}
        </span>
      )}
      {content}
    </>
  );
};

interface Props {
  data: Instruction["data"] & {};
  constants: Constant[];
  method: Method;
  instruction: Instruction;
}

const InstructionDataComponent: React.FC<Props> = ({
  data,
  constants,
  method,
  instruction,
}) => {
  let elements: React.ReactChild[] = [];

  let first = true;
  let i = 0;
  for (const [key, value] of Object.entries(data)) {
    if (first) {
      first = false;
    } else {
      elements.push(<React.Fragment key={`,${i}`}>, </React.Fragment>);
    }
    elements.push(
      <FieldComponent
        instruction={instruction}
        constants={constants}
        fieldName={key}
        field={value}
        method={method}
        key={`p${i}`}
      />
    );
    i++;
  }

  return <>{elements}</>;
};

export default InstructionDataComponent;
