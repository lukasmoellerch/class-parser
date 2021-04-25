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
) => {
  return {
    opcode,
    mnemonic,
    decode,
    toInstruction: (data, offset) => ({ opcode, mnemonic, offset, data }),
  } as InstructionDefinition<
    Mem,
    T,
    { data: T; opcode: number; mnemonic: Mem; offset: number }
  >;
};

const createOffset = (offset: number) => ({
  type: "offset" as const,
  value: offset,
});
const createLocalIndex = (index: number) => ({
  type: "localIndex" as const,
  value: index,
});
const createTypeIndex = (index: number) => ({
  type: "typeIndex" as const,
  value: index,
});
const createIntLiteral = (index: number) => ({
  type: "intLiteral" as const,
  value: index,
});
const createFieldReference = (index: number) => ({
  type: "fieldReference" as const,
  value: index,
});
const createMethodReference = (index: number) => ({
  type: "methodReference" as const,
  value: index,
});
const createConstantReference = (index: number) => ({
  type: "constantReference" as const,
  value: index,
});

export type InstructionDataField =
  | ReturnType<typeof createOffset>
  | ReturnType<typeof createLocalIndex>
  | ReturnType<typeof createTypeIndex>
  | ReturnType<typeof createIntLiteral>
  | ReturnType<typeof createFieldReference>
  | ReturnType<typeof createMethodReference>
  | ReturnType<typeof createConstantReference>;

const branchInstruction = <Mem extends string>(
  opcode: number,
  mnemonic: Mem
) => {
  return instruction(opcode, mnemonic, (decoder) => {
    return { location: createOffset(decoder.getS2()) };
  });
};

export const instructions = [
  instruction(0x32, "aaload"),
  instruction(0x53, "aastore"),
  instruction(0x01, "aconst_null"),
  instruction(0x19, "aload", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  instruction(0x2a, "aload_0"),
  instruction(0x2b, "aload_1"),
  instruction(0x2c, "aload_2"),
  instruction(0x2d, "aload_3"),
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
  instruction(0x4b, "astore_0"),
  instruction(0x4c, "astore_1"),
  instruction(0x4d, "astore_2"),
  instruction(0x4e, "astore_3"),
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
  instruction(0x0e, "dconst_0"),
  instruction(0x0f, "dconst_1"),
  instruction(0x6f, "ddiv"),
  instruction(0x18, "dload", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  instruction(0x26, "dload_0"),
  instruction(0x27, "dload_1"),
  instruction(0x28, "dload_2"),
  instruction(0x29, "dload_3"),
  instruction(0x6b, "dmul"),
  instruction(0x77, "dneg"),
  instruction(0x73, "drem"),
  instruction(0xaf, "dreturn"),
  instruction(0x39, "dstore", (decoder) => {
    return {
      local: createLocalIndex(decoder.getU1()),
    };
  }),
  instruction(0x47, "dstore_0"),
  instruction(0x48, "dstore_1"),
  instruction(0x49, "dstore_2"),
  instruction(0x4a, "dstore_3"),
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
  instruction(0x0b, "fconst_0"),
  instruction(0x0c, "fconst_1"),
  instruction(0x0d, "fconst_2"),
  instruction(0x6e, "fdiv"),
  instruction(0x17, "fload"),
  instruction(0x22, "fload_0"),
  instruction(0x23, "fload_1"),
  instruction(0x24, "fload_2"),
  instruction(0x25, "fload_3"),
  instruction(0x6a, "fmul"),
  instruction(0x76, "fneg"),
  instruction(0x72, "frem"),
  instruction(0xae, "freturn"),
  instruction(0x38, "fstore", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  instruction(0x43, "fstore_0"),
  instruction(0x44, "fstore_1"),
  instruction(0x45, "fstore_2"),
  instruction(0x46, "fstore_3"),
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
  instruction(0x02, "iconst_m1"),
  instruction(0x03, "iconst_0"),
  instruction(0x04, "iconst_1"),
  instruction(0x05, "iconst_2"),
  instruction(0x06, "iconst_3"),
  instruction(0x07, "iconst_4"),
  instruction(0x08, "iconst_5"),
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
  instruction(0x1a, "iload_0"),
  instruction(0x1b, "iload_1"),
  instruction(0x1c, "iload_2"),
  instruction(0x1d, "iload_3"),
  instruction(0x68, "imul"),
  instruction(0x74, "ineg"),
  instruction(0xc1, "instanceof", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { type: createTypeIndex(index) };
  }),
  instruction(0xba, "invokedynamic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    if (decoder.getU1() !== 0) throw new Error();
    if (decoder.getU1() !== 0) throw new Error();
    return { method: createMethodReference(index) };
  }),
  instruction(0xb9, "invokeinterface", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    const count = decoder.getU1();
    if (decoder.getU1() !== 0) throw new Error();
    return {
      method: createMethodReference(index),
      count: createIntLiteral(count),
    };
  }),
  instruction(0xb7, "invokespecial", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index) };
  }),
  instruction(0xb8, "invokestatic", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index) };
  }),
  instruction(0xb6, "invokevirtual", (decoder) => {
    const b1 = decoder.getU1();
    const b2 = decoder.getU1();
    const index = (b1 << 8) | b2;
    return { method: createMethodReference(index) };
  }),
  instruction(0x80, "ior"),
  instruction(0x70, "irem"),
  instruction(0xac, "ireturn"),
  instruction(0x78, "ishl"),
  instruction(0x7a, "ishr"),
  instruction(0x36, "istore", (decoder) => {
    return { local: createLocalIndex(decoder.getU1()) };
  }),
  instruction(0x3b, "istore_0"),
  instruction(0x3c, "istore_1"),
  instruction(0x3d, "istore_2"),
  instruction(0x3e, "istore_3"),
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
  instruction(0x09, "lconst_0"),
  instruction(0x0a, "lconst_1"),
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
  instruction(0x1e, "lload_0"),
  instruction(0x1f, "lload_1"),
  instruction(0x20, "lload_2"),
  instruction(0x21, "lload_3"),
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
  instruction(0x3f, "lstore_0"),
  instruction(0x40, "lstore_1"),
  instruction(0x41, "lstore_2"),
  instruction(0x42, "lstore_3"),
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
    return { atype: createTypeIndex(atype) };
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
    return { index: createLocalIndex(decoder.getU1()) };
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
