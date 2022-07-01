import React from "react";
import { MethodAccessFlags } from "../utils/access-flags-method";
import { Constant } from "../utils/class-decoder";
import { Method } from "../utils/class-parser";
import InstructionComponent from "./Instruction";
import MethodTypeComponent from "./MethodType";

interface Props {
  method: Method;
  constants: Constant[];
}

const getAccessName = (flags: MethodAccessFlags) => {
  if (flags.isPublic) return "public";
  if (flags.isProtected) return "protected";
  if (flags.isPrivate) return "private";
  return "default";
};

const MethodComponent: React.FC<Props> = ({ method, constants }) => {
  const { localVariableData } = method;
  let argNames: string[] | undefined = [];
  let offset = method.accessFlags.isStatic ? 0 : 1;
  for (
    let i = 0;
    argNames !== undefined && i < method.descriptor.parameterTypes.length;
    i++
  ) {
    const j = offset + i;
    if (localVariableData[j] !== undefined) {
      argNames[i] = localVariableData[j].name;
    } else {
      argNames = undefined;
    }
  }
  return (
    <div className="mt-5">
      <div className="flex space-x-2">
        <span className="px-1.5 py-0.5 bg-green-500 bg-opacity-30 rounded">
          {getAccessName(method.accessFlags)}
        </span>
        {method.accessFlags.isStatic && (
          <span className="px-1.5 py-0.5 bg-teal-500 bg-opacity-30 rounded">
            static
          </span>
        )}
        <span className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded">
          <MethodTypeComponent
            type={method.descriptor}
            argNames={argNames}
            name={
              <span className="text-yellow-200 font-semibold">
                {method.name}
              </span>
            }
          />
        </span>
      </div>
      <div className="mt-2">
        {method.instructions.map((instruction) => (
          <InstructionComponent
            key={instruction.offset}
            instruction={instruction}
            constants={constants}
            method={method}
          />
        ))}
      </div>
    </div>
  );
};

export default MethodComponent;
