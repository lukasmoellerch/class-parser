export const createStringParser = (string: string) => {
  let index = 0;

  return {
    peek: () => string[index],
    advance: () => index++,
    eof: () => index >= string.length,
    readUntil: (char: string) => {
      let buffer = "";
      while (string[index] !== char && index < string.length) {
        buffer += string[index++];
      }
      return buffer;
    },
  };
};
export type StringParser = ReturnType<typeof createStringParser>;
