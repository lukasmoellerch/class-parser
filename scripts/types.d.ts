export type RichContentNode =
  | string
  | {
      type: "newline";
    }
  | {
      type: "emphasis";
      children: RichContentNode[];
    }
  | {
      type: "type";
      children: RichContentNode[];
    }
  | {
      type: "symbol";
      children: string;
    }
  | {
      type: "literal";
      children: RichContentNode[];
    }
  | {
      type: "paragraph";
      children: RichContentNode[];
    }
  | {
      type: "xref";
      href: string;
      children: RichContentNode[];
    }
  | {
      type: "ul";
      children: RichContentNode[][];
    };
