import { RichContentNode } from "../scripts/types";

export const asUnformattedString = (node: RichContentNode): string => {
  if (typeof node === "string") {
    return node;
  } else if (node.type === "emphasis") {
    return arrayAsUnformattedString(node.children);
  } else if (node.type === "literal") {
    return arrayAsUnformattedString(node.children);
  } else if (node.type === "type") {
    return arrayAsUnformattedString(node.children);
  } else if (node.type === "symbol") {
    return node.children;
  } else if (node.type === "xref") {
    return arrayAsUnformattedString(node.children);
  } else if (node.type === "paragraph") {
    return arrayAsUnformattedString(node.children);
  } else if (node.type === "newline") {
    return "\n";
  } else if (node.type === "ul") {
    return "";
  }
};

export const arrayAsUnformattedString = (
  richContent: RichContentNode[]
): string => {
  let result = "";
  for (const node of richContent) {
    result += asUnformattedString(node);
  }
  return result;
};
