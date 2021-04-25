const FIELD_ACC_PUBLIC = 0x0001;
const FIELD_ACC_PRIVATE = 0x0002;
const FIELD_ACC_PROTECTED = 0x0004;
const FIELD_ACC_STATIC = 0x0008;
const FIELD_ACC_FINAL = 0x0010;
const FIELD_ACC_VOLATILE = 0x0040;
const FIELD_ACC_TRANSIENT = 0x0080;
const FIELD_ACC_SYNTHETIC = 0x1000;
const FIELD_ACC_ENUM = 0x4000;

export interface FieldAccessFlags {
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isFinal: boolean;
  isVolatile: boolean;
  isTransient: boolean;
  isSynthetic: boolean;
  isEnum: boolean;
}

export const parseFieldAccessFlags = (flags: number): FieldAccessFlags => {
  return {
    isPublic: 0 !== (flags & FIELD_ACC_PUBLIC),
    isPrivate: 0 !== (flags & FIELD_ACC_PRIVATE),
    isProtected: 0 !== (flags & FIELD_ACC_PROTECTED),
    isStatic: 0 !== (flags & FIELD_ACC_STATIC),
    isFinal: 0 !== (flags & FIELD_ACC_FINAL),
    isVolatile: 0 !== (flags & FIELD_ACC_VOLATILE),
    isTransient: 0 !== (flags & FIELD_ACC_TRANSIENT),
    isSynthetic: 0 !== (flags & FIELD_ACC_SYNTHETIC),
    isEnum: 0 !== (flags & FIELD_ACC_ENUM),
  };
};
