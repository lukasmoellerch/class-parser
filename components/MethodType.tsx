import React from "react";
import { MethodType } from "../utils/method-descriptor-parser";
import FieldTypeComponent from "./FieldType";

interface Props {
  name?: React.ReactChild;
  type: MethodType;
}

const MethodTypeComponent: React.FC<Props> = ({ name, type }) => {
  let elements: React.ReactChild[] = [];
  elements.push(<FieldTypeComponent type={type.returnType} key="return" />);
  elements.push(<React.Fragment key="A"> </React.Fragment>);
  if (name) {
    elements.push(<React.Fragment key="name">{name}</React.Fragment>);
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
