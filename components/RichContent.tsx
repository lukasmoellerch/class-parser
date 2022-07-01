import { RichContentNode } from "../scripts/types";

interface RichContentProps {
  node: RichContentNode;
}

const RichContentComponent: React.FC<RichContentProps> = ({ node }) => {
  if (typeof node === "string") {
    return <>{node}</>;
  } else if (node.type === "emphasis") {
    return (
      <em className="font-extrabold">
        {renderRichContentArray(node.children)}
      </em>
    );
  } else if (node.type === "literal") {
    return (
      <code className="font-mono text-green-400">
        {renderRichContentArray(node.children)}
      </code>
    );
  } else if (node.type === "type") {
    return (
      <code className="font-mono text-red-400">
        {renderRichContentArray(node.children)}
      </code>
    );
  } else if (node.type === "symbol") {
    return <>{node.children}</>;
  } else if (node.type === "xref") {
    return (
      <a href={node.href} className="underline">
        {renderRichContentArray(node.children)}
      </a>
    );
  } else if (node.type === "paragraph") {
    return <p>{renderRichContentArray(node.children)}</p>;
  } else if (node.type === "newline") {
    return <br />;
  } else if (node.type === "ul") {
    return (
      <ul className="list-disc list-inside">
        {node.children.map((child, i) => (
          <li key={i}>{renderRichContentArray(child)}</li>
        ))}
      </ul>
    );
  }
};
export const renderRichContentArray = (nodes: RichContentNode[]) => {
  return nodes.map((node, i) => <RichContentComponent key={i} node={node} />);
};

export default RichContentComponent;
