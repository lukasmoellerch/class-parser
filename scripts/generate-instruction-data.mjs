import { load } from "cheerio";
import { Node, isTag, isText } from "domhandler/lib/node.js";
import fs from "node:fs/promises";
import fetch from "node-fetch";
import { join } from "node:path";

/** @typedef { import('cheerio').Element } Element */
/** @typedef { import('./types').RichContentNode } RichContentNode */

/**
 * @param {import('cheerio').CheerioAPI} doc
 * @param {import('cheerio').Cheerio<Element>} element
 * @returns {Element}
 */
function getInstructionsSection(doc, element) {
  for (let e of element.toArray()) {
    if (doc(e).find("h2").text().includes("Instructions")) {
      return e;
    }
  }
  throw new Error("Instructions section not found");
}

/**
 *
 * @param {Node[]} nodes
 * @returns {RichContentNode[]}
 */
function richTextParse(nodes) {
  /**
   * @type {RichContentNode[]}
   */
  const result = [];
  for (const node of nodes) {
    if (isText(node) && node.data.length > 0) {
      if (result.length > 0 && typeof result[result.length - 1] === "string") {
        result[result.length - 1] = (
          result[result.length - 1] + node.data
        ).replace(/[ \t\n]+|\n/g, " ");
      } else {
        result.push(node.data.replace(/[ \t\n]+|\n/g, " "));
      }
    } else if (isTag(node)) {
      if (node.name === "a" && node.attribs.href === undefined) {
        // Ignore
      } else if (node.name === "span" && node.attribs.class === "emphasis") {
        if (node.children.length !== 1) throw new Error("expected 1 child");
        const firstChild = node.children[0];
        if (!isTag(firstChild)) throw new Error("expected tag");
        result.push({
          type: "emphasis",
          children: richTextParse(firstChild.childNodes),
        });
      } else if (node.name === "span" && node.attribs.class === "symbol") {
        if (node.children.length !== 1) throw new Error("expected 1 child");
        const firstChild = node.children[0];
        if (!isText(firstChild)) throw new Error("expected text");
        result.push({
          type: "symbol",
          children: firstChild.data,
        });
      } else if (node.name === "code" && node.attribs.class === "literal") {
        if (node.children.length !== 1) throw new Error("expected 1 child");
        result.push({
          type: "literal",
          children: richTextParse(node.childNodes),
        });
      } else if (node.name === "a" && node.attribs.class === "xref") {
        result.push({
          type: "xref",
          href: node.attribs.href,
          children: richTextParse(node.childNodes),
        });
      } else if (node.name === "span" && node.attribs.class === "type") {
        result.push({
          type: "type",
          children: richTextParse(node.childNodes),
        });
      } else if (node.name === "p") {
        result.push({
          type: "paragraph",
          href: node.attribs.href,
          children: richTextParse(node.childNodes),
        });
      } else if (node.name === "br") {
        if (result.length !== 0) {
          result.push({
            type: "newline",
          });
        }
      } else if (node.name === "ul") {
        result.push({
          type: "ul",
          children: node.children
            .map((c) =>
              isTag(c) && c.name === "li"
                ? richTextParse(c.childNodes)
                : undefined
            )
            .filter((x) => x !== undefined),
        });
      } else {
        console.warn(
          `Unexpected node type: ${node.name} ${node.attribs.class}`
        );
      }
    }
  }
  return result;
}

const main = async () => {
  const resp = await fetch(
    "https://docs.oracle.com/javase/specs/jvms/se17/html/jvms-6.html"
  );
  const data = await resp.arrayBuffer();
  const doc = load(Buffer.from(data));
  const sections = doc(".chapter > .section");
  const instructionsSection = getInstructionsSection(doc, sections);
  const instructions = doc(instructionsSection).children(".section-execution");

  /**
   * @type {Promise<void>[]}
   */
  const promises = [];
  for (let instruction of instructions.toArray()) {
    const instructionName = doc(instruction)
      .children(".titlepage")
      .text()
      .trim();

    /**
     * @type {{
     *   type: string;
     *   content: RichContentNode[];
     * }[]}
     */
    const sectionData = [];

    /**
     * @type {{ mnemonic: string, opcode: number }[]}
     */
    const forms = [];
    const sections = doc(instruction).children(".section");
    for (let section of sections.toArray()) {
      const sectionName = doc(section).children(".titlepage").text().trim();
      const sectionBlocks = doc(section).children(":not(.titlepage)");
      if (sectionName === "Forms") {
        const formsText = sectionBlocks.text();

        const regex = /([^ ]+) = (\d+) \(0x[0-9a-f]+\)/g;

        /**
         * @type {RegExpExecArray}
         */
        let result;
        while ((result = regex.exec(formsText))) {
          forms.push({
            mnemonic: result[1],
            opcode: parseInt(result[2], 10),
          });
        }
        if (forms.length === 0) {
          console.warn(
            `Forms could not be parsed for ${instructionName}: \n${JSON.stringify(
              formsText
            )}`
          );
        }
      } else {
        const blocks = [];
        for (let sectionBlock of sectionBlocks.toArray()) {
          const blockType = sectionBlock.attribs["class"];
          if (
            blockType === "norm" ||
            blockType === "norm-dynamic" ||
            blockType === "norm-error" ||
            blockType === "literallayout"
          ) {
            const content = richTextParse(sectionBlock.childNodes);
            blocks.push({
              type: blockType,
              content,
            });
          }
        }
        sectionData.push({
          name: sectionName,
          blocks,
        });
      }
    }

    promises.push(
      fs.writeFile(
        join("./public/instructions/", instructionName + ".json"),
        JSON.stringify({
          forms,
          sections: sectionData,
        })
      )
    );
    for (const form of forms) {
      promises.push(
        fs.writeFile(
          join("./public/mnemonics/", form.mnemonic + ".json"),
          JSON.stringify({
            forms,
            sections: sectionData,
          })
        )
      );
      promises.push(
        fs.writeFile(
          join("./public/opcodes/", form.opcode + ".json"),
          JSON.stringify({
            forms,
            sections: sectionData,
          })
        )
      );
    }
  }
  await Promise.all(promises);
};

main();
