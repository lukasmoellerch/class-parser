import React from "react";
import { MethodType } from "../utils/method-descriptor-parser";
import FieldTypeComponent from "./FieldType";

interface Props {
  name?: string;
  type: MethodType;
  href?: string;
}

const MethodTypeComponent: React.FC<Props> = ({ name, type, href }) => {
  let elements: React.ReactChild[] = [];
  elements.push(<FieldTypeComponent type={type.returnType} key="return" />);
  elements.push(<React.Fragment key="A"> </React.Fragment>);
  if (name) {
    if (href) {
      elements.push(
        <a
          href={href}
          key="name"
          className="underline text-yellow-200 font-semibold"
        >
          {name}
        </a>
      );
    } else {
      elements.push(
        <span key="name" className="text-yellow-200 font-semibold">
          {name}
        </span>
      );
    }
  }
  let first = true;
  let i = 0;
  elements.push(<React.Fragment key="B">{"("}</React.Fragment>);
  for (const parameter of type.parameterTypes) {
    if (first) {
      first = false;
    } else {
      elements.push(<span key={`,${i}`}>, </span>);
    }
    elements.push(<FieldTypeComponent type={parameter} key={`p${i}`} />);
    i++;
  }
  elements.push(<React.Fragment key="C">{")"}</React.Fragment>);
  return <>{elements}</>;
};

export default MethodTypeComponent;
