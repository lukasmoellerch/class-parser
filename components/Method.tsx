import React from "react";
import { MethodAccessFlags } from "../utils/access-flags-method";
import { Constant } from "../utils/class-decoder";
import { Method } from "../utils/class-parser";
import InstructionDataComponent from "./InstructionData";
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
  return (
    <div className="mt-5">
      <div className="flex space-x-2">
        <span className="px-1.5 py-0.5 bg-green-500 bg-opacity-30 rounded">
          {getAccessName(method.accessFlags)}
        </span>
        <span className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded">
          <MethodTypeComponent
            type={method.descriptor}
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
          <div key={instruction.offset} className="flex items-start space-x-2">
            <div className="text-blue-300 whitespace-pre">
              {" "}
              {instruction.offset.toString().padStart(5)}:
            </div>
            <div className="text-blue-100 text-opacity-40 hover:text-opacity-100">
              0x
              {instruction.opcode.toString(16).padStart(2, "0")}
            </div>
            <div className="text-red-400 font-bold">
              {instruction.mnemonic}{" "}
            </div>
            {instruction.data && (
              <div>
                <InstructionDataComponent
                  constants={constants}
                  data={instruction.data}
                  instruction={instruction}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MethodComponent;
