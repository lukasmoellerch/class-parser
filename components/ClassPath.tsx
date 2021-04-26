interface Props {
  path: string[];
}
const ClassPath: React.FC<Props> = ({ path }) => {
  let elements: React.ReactChild[] = [];
  let first = true;
  let i = 0;
  const displayPath = path.slice(path.length - 1);
  for (const component of displayPath) {
    if (first) {
      first = false;
    } else {
      elements.push(
        <span key={`.${i}`} className="text-opacity-75 text-green-200">
          .
        </span>
      );
    }
    elements.push(
      <span key={`p${i}`} className="text-green-100">
        {component}
      </span>
    );
    i++;
  }
  if (path[0] === "java") {
    return (
      <a
        title={path.join(".")}
        href={`https://docs.oracle.com/javase/9/docs/api/${path.join(
          "/"
        )}.html`}
        className="underline"
      >
        {elements}
      </a>
    );
  }
  return <span title={path.join(".")}>{elements}</span>;
};

export default ClassPath;
