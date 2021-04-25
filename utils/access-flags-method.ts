const METHOD_ACC_PUBLIC = 0x0001;
const METHOD_ACC_PRIVATE = 0x0002;
const METHOD_ACC_PROTECTED = 0x0004;
const METHOD_ACC_STATIC = 0x0008;
const METHOD_ACC_FINAL = 0x0010;
const METHOD_ACC_SYNCHRONIZED = 0x0020;
const METHOD_ACC_BRIDGE = 0x0040;
const METHOD_ACC_VARARGS = 0x0080;
const METHOD_ACC_NATIVE = 0x0100;
const METHOD_ACC_ABSTRACT = 0x0400;
const METHOD_ACC_STRICT = 0x0800;
const METHOD_ACC_SYNTHETIC = 0x1000;

export interface MethodAccessFlags {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isSynchronized: boolean;
  isBridge: boolean;
  isVarargs: boolean;
  isNative: boolean;
  isAbstract: boolean;
  isStrict: boolean;
  isSynthetic: boolean;
}

export const parseMethodAccessFlags = (flags: number): MethodAccessFlags => {
  return {
    isPublic: 0 !== (flags & METHOD_ACC_PUBLIC),
    isPrivate: 0 !== (flags & METHOD_ACC_PRIVATE),
    isProtected: 0 !== (flags & METHOD_ACC_PROTECTED),
    isStatic: 0 !== (flags & METHOD_ACC_STATIC),
    isFinal: 0 !== (flags & METHOD_ACC_FINAL),
    isSynchronized: 0 !== (flags & METHOD_ACC_SYNCHRONIZED),
    isBridge: 0 !== (flags & METHOD_ACC_BRIDGE),
    isVarargs: 0 !== (flags & METHOD_ACC_VARARGS),
    isNative: 0 !== (flags & METHOD_ACC_NATIVE),
    isAbstract: 0 !== (flags & METHOD_ACC_ABSTRACT),
    isStrict: 0 !== (flags & METHOD_ACC_STRICT),
    isSynthetic: 0 !== (flags & METHOD_ACC_SYNTHETIC),
  };
};
