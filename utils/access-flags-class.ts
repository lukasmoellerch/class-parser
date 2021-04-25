const CLASS_ACC_PUBLIC = 0x0001;
const CLASS_ACC_FINAL = 0x0010;
const CLASS_ACC_SUPER = 0x0020;
const CLASS_ACC_INTERFACE = 0x0200;
const CLASS_ACC_ABSTRACT = 0x0400;
const CLASS_ACC_SYNTHETIC = 0x1000;
const CLASS_ACC_ANNOTATION = 0x2000;
const CLASS_ACC_ENUM = 0x4000;

export interface ClassAccessFlags {
  isPublic: boolean;
  isFinal: boolean;
  isSuper: boolean;
  isInterface: boolean;
  isAbstract: boolean;
  isSynthetic: boolean;
  isAnnotation: boolean;
  isEnum: boolean;
}

export const parseClassAccessFlags = (flags: number): ClassAccessFlags => {
  return {
    isPublic: 0 !== (flags & CLASS_ACC_PUBLIC),
    isFinal: 0 !== (flags & CLASS_ACC_FINAL),
    isSuper: 0 !== (flags & CLASS_ACC_SUPER),
    isInterface: 0 !== (flags & CLASS_ACC_INTERFACE),
    isAbstract: 0 !== (flags & CLASS_ACC_ABSTRACT),
    isSynthetic: 0 !== (flags & CLASS_ACC_SYNTHETIC),
    isAnnotation: 0 !== (flags & CLASS_ACC_ANNOTATION),
    isEnum: 0 !== (flags & CLASS_ACC_ENUM),
  };
};
