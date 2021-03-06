import { parseArrayType } from "./array-types";
import { Constant } from "./class-decoder";
import { Decoder } from "./decoder";

interface InstructionDefinition<Mem, T, X> {
  opcode: number;
  mnemonic: Mem;
  decode?: (decoder: Decoder, constants: Constant[]) => T;
  toInstruction?: (data: T, location: number) => X;
}
const instruction = <Mem extends string, T = void>(
  opcode: number,
  mnemonic: Mem,
  decode?: (decoder: Decoder, constants: Constant[]) => T
): InstructionDefinition<
  Mem,
  T,
  { data: T; opcode: number; mnemonic: Mem; offset: number }
> => {
  return {
    opcode,
    mnemonic,
    decode,
    toInstruction: (data, offset) => ({ opcode, mnemonic, offset, data }),
  };
};

const branchInstruction = <Mem extends string>(
  opcode: number,
  mnemonic: Mem
) => {
  return instruction(opcode, mnemonic, (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  });
};

const loadStoreInstruction = <Mem extends string>(
  opcode: number,
  mnemonic: Mem,
  index: number
) => {
  return instruction(opcode, mnemonic, () => {
    return { local: createLocalIndex(index) };
  });
};

const createOffset = (offset: number, labelHidden = true) => ({
  type: "offset" as const,
  value: offset,
  labelHidden,
});
const createLocalIndex = (index: number, labelHidden = true) => ({
  type: "localIndex" as const,
  value: index,
  labelHidden,
});
const createTypeIndex = (index: number, labelHidden = true) => ({
  type: "typeIndex" as const,
  value: index,
  labelHidden,
});
const createIntLiteral = (index: number, labelHidden = true) => ({
  type: "intLiteral" as const,
  value: index,
  labelHidden,
});
const createFieldReference = (index: number, labelHidden = true) => ({
  type: "fieldReference" as const,
  value: index,
  labelHidden,
});
const createMethodReference = (index: number, labelHidden = true) => ({
  type: "methodReference" as const,
  value: index,
  labelHidden,
});
const createCallSiteReference = (index: number, labelHidden = true) => ({
  type: "callSiteReference" as const,
  value: index,
  labelHidden,
});
const createConstantReference = (index: number, labelHidden = true) => ({
  type: "constantReference" as const,
  value: index,
  labelHidden,
});
const createPrimitiveType = (name: string, labelHidden = true) => ({
  type: "primitiveType" as const,
  name,
  labelHidden,
});

export type InstructionDataField =
  | ReturnType<typeof createOffset>
  | ReturnType<typeof createLocalIndex>
  | ReturnType<typeof createTypeIndex>
  | ReturnType<typeof createIntLiteral>
  | ReturnType<typeof createFieldReference>
  | ReturnType<typeof createMethodReference>
  | ReturnType<typeof createConstantReference>
  | ReturnType<typeof createCallSiteReference>
  | ReturnType<typeof createPrimitiveType>;

export const instructions = [
  instruction(0x32, "aaload"),
  instruction(0x53, "aastore"),
  instruction(0x01, "aconst_null"),
  instruction(0x19, "aload", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1(), false),
    };
  }),
  loadStoreInstruction(0x2a, "aload", 0),
  loadStoreInstruction(0x2b, "aload", 1),
  loadStoreInstruction(0x2c, "aload", 2),
  loadStoreInstruction(0x2d, "aload", 3),
  instruction(0xbd, "anewarray", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const typeIndex = (b1 << 8) | b2;
    return { type: createTypeIndex(typeIndex) };
  }),
  instruction(0xb0, "areturn"),
  instruction(0xbe, "arraylength"),
  instruction(0x3a, "astore", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  loadStoreInstruction(0x4b, "astore", 0),
  loadStoreInstruction(0x4c, "astore", 1),
  loadStoreInstruction(0x4d, "astore", 2),
  loadStoreInstruction(0x4e, "astore", 3),
  instruction(0xbf, "athrow"),
  instruction(0x33, "baload"),
  instruction(0x54, "bastore"),
  instruction(0x10, "bipush", (decoder) => {
    return {
      value: createIntLiteral(decoder.getU1()),
    };
  }),
  instruction(0x34, "caload"),
  instruction(0x55, "castore"),
  instruction(0xc0, "checkcast", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const typeIndex = (b1 << 8) | b2;
    return { type: createTypeIndex(typeIndex) };
  }),
  instruction(0x90, "d2f"),
  instruction(0x8e, "d2i"),
  instruction(0x8f, "d2l"),
  instruction(0x63, "dadd"),
  instruction(0x31, "daload"),
  instruction(0x52, "dastore"),
  instruction(0x98, "dcmpg"),
  instruction(0x97, "dcmpl"),
  instruction(0x0e, "dconst", () => {
    return { value: createIntLiteral(0) };
  }),
  instruction(0x0f, "dconst", () => {
    return { value: createIntLiteral(1) };
  }),
  instruction(0x6f, "ddiv"),
  instruction(0x18, "dload", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  loadStoreInstruction(0x26, "dload", 0),
  loadStoreInstruction(0x27, "dload", 1),
  loadStoreInstruction(0x28, "dload", 2),
  loadStoreInstruction(0x29, "dload", 3),
  instruction(0x6b, "dmul"),
  instruction(0x77, "dneg"),
  instruction(0x73, "drem"),
  instruction(0xaf, "dreturn"),
  instruction(0x39, "dstore", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  loadStoreInstruction(0x47, "dstore", 0),
  loadStoreInstruction(0x48, "dstore", 1),
  loadStoreInstruction(0x49, "dstore", 2),
  loadStoreInstruction(0x4a, "dstore", 3),
  instruction(0x67, "dsub"),
  instruction(0x59, "dup"),
  instruction(0x5a, "dup_x1"),
  instruction(0x5b, "dup_x2"),
  instruction(0x5c, "dup2"),
  instruction(0x5d, "dup2_x1"),
  instruction(0x5e, "dup2_x2"),
  instruction(0x8d, "f2d"),
  instruction(0x8b, "f2i"),
  instruction(0x8c, "f2l"),
  instruction(0x62, "fadd"),
  instruction(0x30, "faload"),
  instruction(0x51, "fastore"),
  instruction(0x96, "fcmpg"),
  instruction(0x95, "fcmpl"),
  instruction(0x0b, "fconst", () => {
    return { value: createIntLiteral(0) };
  }),
  instruction(0x0c, "fconst", () => {
    return { value: createIntLiteral(1) };
  }),
  instruction(0x0d, "fconst", () => {
    return { value: createIntLiteral(2) };
  }),
  instruction(0x6e, "fdiv"),
  instruction(0x17, "fload"),
  loadStoreInstruction(0x22, "fload", 0),
  loadStoreInstruction(0x23, "fload", 1),
  loadStoreInstruction(0x24, "fload", 2),
  loadStoreInstruction(0x25, "fload", 3),
  instruction(0x6a, "fmul"),
  instruction(0x76, "fneg"),
  instruction(0x72, "frem"),
  instruction(0xae, "freturn"),
  instruction(0x38, "fstore", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  loadStoreInstruction(0x43, "fstore", 0),
  loadStoreInstruction(0x44, "fstore", 1),
  loadStoreInstruction(0x45, "fstore", 2),
  loadStoreInstruction(0x46, "fstore", 3),
  instruction(0x66, "fsub"),
  instruction(0xb4, "getfield", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { field: createFieldReference(index) };
  }),
  instruction(0xb2, "getstatic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { field: createFieldReference(index) };
  }),
  instruction(0xa7, "goto", (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  }),
  instruction(0xc8, "goto_w", (decoder) => {
    return { location: createOffset(decoder.getS4()) };
  }),
  instruction(0x91, "i2b"),
  instruction(0x92, "i2c"),
  instruction(0x87, "i2d"),
  instruction(0x86, "i2f"),
  instruction(0x85, "i2l"),
  instruction(0x93, "i2s"),
  instruction(0x60, "iadd"),
  instruction(0x2e, "iaload"),
  instruction(0x7e, "iand"),
  instruction(0x4f, "iastore"),
  instruction(0x02, "iconst", () => {
    return { value: createIntLiteral(-1) };
  }),
  instruction(0x03, "iconst", () => {
    return { value: createIntLiteral(0) };
  }),
  instruction(0x04, "iconst", () => {
    return { value: createIntLiteral(1) };
  }),
  instruction(0x05, "iconst", () => {
    return { value: createIntLiteral(2) };
  }),
  instruction(0x06, "iconst", () => {
    return { value: createIntLiteral(3) };
  }),
  instruction(0x07, "iconst", () => {
    return { value: createIntLiteral(4) };
  }),
  instruction(0x08, "iconst", () => {
    return { value: createIntLiteral(5) };
  }),
  instruction(0x6c, "idiv"),
  instruction(0xa5, "if_acmpeq", (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  }),
  instruction(0xa6, "if_acmpne", (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  }),
  branchInstruction(0x9f, "if_icmpeq"),
  branchInstruction(0xa0, "if_icmpne"),
  branchInstruction(0xa1, "if_icmplt"),
  branchInstruction(0xa2, "if_icmpge"),
  branchInstruction(0xa3, "if_icmpgt"),
  branchInstruction(0xa4, "if_icmple"),
  branchInstruction(0x99, "ifeq"),
  branchInstruction(0x9a, "ifne"),
  branchInstruction(0x9b, "iflt"),
  branchInstruction(0x9c, "ifge"),
  branchInstruction(0x9d, "ifgt"),
  branchInstruction(0x9e, "ifle"),
  branchInstruction(0xc7, "ifnonnull"),
  branchInstruction(0xc6, "ifnull"),
  instruction(0x84, "iinc", (decoder) => {
    const index = decoder.getU1();
    const constant = decoder.getU1();
    return {
      local: createLocalIndex(index),
      value: createIntLiteral(constant),
    };
  }),
  instruction(0x15, "iload", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  loadStoreInstruction(0x1a, "iload", 0),
  loadStoreInstruction(0x1b, "iload", 1),
  loadStoreInstruction(0x1c, "iload", 2),
  loadStoreInstruction(0x1d, "iload", 3),
  instruction(0x68, "imul"),
  instruction(0x74, "ineg"),
  instruction(0xc1, "instanceof", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { type: createTypeIndex(index, false) };
  }),
  instruction(0xba, "invokedynamic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    if (decoder.getU1() !== 0) throw new Error();
    if (decoder.getU1() !== 0) throw new Error();
    return { method: createCallSiteReference(index, false) };
  }),
  instruction(0xb9, "invokeinterface", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    const count = decoder.getU1();
    if (decoder.getU1() !== 0) throw new Error();
    return {
      method: createMethodReference(index, false),
      count: createIntLiteral(count, false),
    };
  }),
  instruction(0xb7, "invokespecial", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index, false) };
  }),
  instruction(0xb8, "invokestatic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index, false) };
  }),
  instruction(0xb6, "invokevirtual", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index, false) };
  }),
  instruction(0x80, "ior"),
  instruction(0x70, "irem"),
  instruction(0xac, "ireturn"),
  instruction(0x78, "ishl"),
  instruction(0x7a, "ishr"),
  instruction(0x36, "istore", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  loadStoreInstruction(0x3b, "istore", 0),
  loadStoreInstruction(0x3c, "istore", 1),
  loadStoreInstruction(0x3d, "istore", 2),
  loadStoreInstruction(0x3e, "istore", 3),
  instruction(0x64, "isub"),
  instruction(0x7c, "iushr"),
  instruction(0x82, "ixor"),
  instruction(0xa8, "jsr", (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  }),
  instruction(0xc9, "jsr_w", (decoder) => {
    return { location: createOffset(decoder.getS4()) };
  }),
  instruction(0x8a, "l2d"),
  instruction(0x89, "l2f"),
  instruction(0x88, "l2i"),
  instruction(0x61, "ladd"),
  instruction(0x2f, "laload"),
  instruction(0x7f, "land"),
  instruction(0x50, "lastore"),
  instruction(0x94, "lcmp"),
  instruction(0x09, "lconst", () => {
    return { value: createIntLiteral(0) };
  }),
  instruction(0x0a, "lconst", () => {
    return { value: createIntLiteral(1) };
  }),
  instruction(0x12, "ldc", (decoder) => {
    return { constant: createConstantReference(decoder.getU1()) };
  }),
  instruction(0x13, "ldc_w", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { constant: createConstantReference(index) };
  }),
  instruction(0x14, "ldc2_w", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { constant: createConstantReference(index) };
  }),
  instruction(0x6d, "ldiv"),
  instruction(0x16, "lload", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  loadStoreInstruction(0x1e, "lload", 0),
  loadStoreInstruction(0x1f, "lload", 1),
  loadStoreInstruction(0x20, "lload", 2),
  loadStoreInstruction(0x21, "lload", 3),
  instruction(0x69, "lmul"),
  instruction(0x75, "lneg"),
  instruction(0xab, "lookupswitch", (decoder) => {
    const index = decoder.getIndex();
    const skip = index % 4 === 0 ? 0 : 4 - (index % 4);
    decoder.skip(skip);
    const defaultOffset = decoder.getU4();
    const npairs = decoder.getU4();
    const pairs: [number, number][] = [];
    for (let i = 0; i < npairs; i++) {
      pairs.push([decoder.getU4(), decoder.getU4()]);
    }
    return { pairs, defaultOffset };
  }),
  instruction(0x81, "lor"),
  instruction(0x71, "lrem"),
  instruction(0xad, "lreturn"),
  instruction(0x79, "lshl"),
  instruction(0x7b, "lshr"),
  instruction(0x37, "lstore", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  loadStoreInstruction(0x3f, "lstore", 0),
  loadStoreInstruction(0x40, "lstore", 1),
  loadStoreInstruction(0x41, "lstore", 2),
  loadStoreInstruction(0x42, "lstore", 3),
  instruction(0x65, "lsub"),
  instruction(0x7d, "lushr"),
  instruction(0x83, "lxor"),
  instruction(0xc2, "monitorenter"),
  instruction(0xc3, "monitorexit"),
  instruction(0xc5, "multianewarray", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    const dimensions = decoder.getU1();
    return {
      type: createTypeIndex(index),
      dimensions: createIntLiteral(dimensions),
    };
  }),
  instruction(0xbb, "new", (decoder, constants) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { type: createTypeIndex(index) };
  }),
  instruction(0xbc, "newarray", (decoder) => {
    const atype = decoder.getU1();
    return { atype: createPrimitiveType(parseArrayType(atype)) };
  }),
  instruction(0x00, "nop"),
  instruction(0x57, "pop"),
  instruction(0x58, "pop2"),
  instruction(0xb5, "putfield", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { field: createFieldReference(index) };
  }),
  instruction(0xb3, "putstatic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { field: createFieldReference(index) };
  }),
  instruction(0xa9, "ret", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  instruction(0xb1, "return"),
  instruction(0x35, "saload"),
  instruction(0x56, "sastore"),
  instruction(0x11, "sipush", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const value = (b1 << 8) | b2;
    return { value: createIntLiteral(value) };
  }),
  instruction(0x5f, "swap"),
  instruction(0xaa, "tableswitch", (decoder) => {
    const index = decoder.getIndex();
    const skip = index % 4 === 0 ? 0 : 4 - (index % 4);
    decoder.skip(skip);
    const defaultOffset = decoder.getU4();
    const low = decoder.getU4();
    const high = decoder.getU4();
    const offsets: number[] = [];
    for (let x = low; x < high; x++) {
      offsets.push(decoder.getU4());
    }
    return { defaultOffset, low, high, offsets };
  }),
  instruction(0xc4, "wide", () => {
    throw new Error();
  }),
] as const;

export type Instruction = ReturnType<
  typeof instructions[number]["toInstruction"]
>;

const createDisassembler = () => {
  let map: Map<number, InstructionDefinition<any, any, any>> = new Map();
  for (const instruction of instructions) {
    if (map.has(instruction.opcode))
      throw new Error(
        `duplicate opcode: 0x${instruction.opcode
          .toString(16)
          .padStart(2, "0")}`
      );
    map.set(instruction.opcode, instruction);
  }
  let array: (InstructionDefinition<any, any, any> | undefined)[] = [];
  for (let i = 0; i <= 0xff; i++) {
    array[i] = map.get(i);
  }
  return (decoder: Decoder, constants: Constant[]) => {
    let instructions: Instruction[] = [];
    while (!decoder.eof()) {
      const offset = decoder.getIndex();
      const opcode = decoder.getU1();
      const instruction = array[opcode];
      if (instruction === undefined) {
        console.warn("unknown opcode: " + opcode);
        continue;
      }
      const decode = instruction.decode;
      if (decode !== undefined) {
        const data = decode(decoder, constants);
        instructions.push(instruction.toInstruction(data, offset));
      } else {
        instructions.push(instruction.toInstruction(undefined, offset));
      }
    }
    return instructions;
  };
};

export const disassembler = createDisassembler();
