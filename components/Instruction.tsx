import React from "react";
import { useQuery } from "react-query";
import { Constant } from "../utils/class-decoder";
import { Method } from "../utils/class-parser";
import { Instruction } from "../utils/disassembler";
import { InstructionData } from "../utils/instruction-data";
import { arrayAsUnformattedString } from "../utils/rich-content";
import InstructionDataComponent from "./InstructionData";

interface Props {
  instruction: Instruction;
  method: Method;
  constants: Constant[];
}

const InstructionComponent: React.FC<Props> = ({
  instruction,
  method,
  constants,
}) => {
  const { data: instructionMetaData } = useQuery(
    ["opcode", instruction.opcode],
    {
      queryFn: () =>
        fetch(`/opcodes/${instruction.opcode}.json`).then((x) =>
          x.json()
        ) as Promise<InstructionData>,
    }
  );

  return (
    <div className="flex items-start space-x-2">
      <div className="text-teal-300 whitespace-pre">
        {" "}
        {instruction.offset.toString().padStart(4)}:
      </div>
      <div className="text-teal-100 text-opacity-40 hover:text-opacity-100 tracking-tighter">
        {instruction.opcode.toString(16).padStart(2, "0")}
      </div>
      <div
        className="text-red-400 font-bold"
        title={
          instructionMetaData
            ? instructionMetaData.sections
                .find((x) => x.name === "Operation")
                ?.blocks.map((x) => arrayAsUnformattedString(x.content))
                .join("\n")
            : undefined
        }
      >
        {instruction.mnemonic}{" "}
      </div>
      {instruction.data && (
        <div className="space-x-0">
          <InstructionDataComponent
            constants={constants}
            data={instruction.data}
            method={method}
            instruction={instruction}
          />
        </div>
      )}
    </div>
  );
};

export default InstructionComponent;
