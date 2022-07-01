import { RichContentNode } from "../scripts/types";

export interface InstructionData {
  name: string;
  sections: {
    name: string;
    blocks: {
      type: string;
      content: RichContentNode[];
    }[];
  }[];
}
