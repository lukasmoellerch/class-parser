import React from "react";
import { FieldAccessFlags } from "../utils/access-flags-field";
import { Constant } from "../utils/class-decoder";
import { Field } from "../utils/class-parser";
import FieldTypeComponent from "./FieldType";

interface Props {
  field: Field;
  constants: Constant[];
}

const getAccessName = (flags: FieldAccessFlags) => {
  if (flags.isPublic) return "public";
  if (flags.isProtected) return "protected";
  if (flags.isPrivate) return "private";
  return "default";
};

const FieldComponent: React.FC<Props> = ({ field }) => {
  return (
    <div className="mt-5">
      <div className="flex space-x-2">
        <span className="px-1.5 py-0.5 bg-green-500 bg-opacity-30 rounded">
          {getAccessName(field.accessFlags)}
        </span>
        <span className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded">
          <FieldTypeComponent type={field.descriptor} />
        </span>
        <span className="px-1.5 py-0.5 bg-purple-400 bg-opacity-30 rounded">
          {field.name}
        </span>
      </div>
    </div>
  );
};

export default FieldComponent;
