# class-parse

Demo: [class-parser.lukas-moeller.ch!](http://class-parser.lukas-moeller.ch)

This project implements a rudimentary .class file parser,  mostly following the Java SE9 spec. It only supports a few select attribute types, but can disassemble most instructions, with the major exception of the pseudo "wide" opcode. Its mostly an experiment that tries to provide a better visualization than existing tools without requiring a dedicated installation.

## Internals

The decoder first makes a rather rough pass over the file, not decoding any attributes, and leaving constant-pointers in place. In a second step the parser uses the data of that rough parse to locate interesting attributes, inlining data from the constant table while doing so. When a code attribute is found a simple disassembler is applied to the data.

The resulting data is then displayed using a simple React application.
