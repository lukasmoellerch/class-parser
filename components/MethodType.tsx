import React from "react";
import { MethodType } from "../utils/method-descriptor-parser";
import FieldTypeComponent from "./FieldType";
import Identifier from "./Identifier";

interface Props {
  name?: React.ReactChild;
  argNames?: string[];
  type: MethodType;
}

const MethodTypeComponent: React.FC<Props> = ({ name, argNames, type }) => {
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
    if (argNames !== undefined) {
      elements.push(<React.Fragment key={`s${i}`}> </React.Fragment>);
      elements.push(<Identifier key={`n${i}`}>{argNames[i]}</Identifier>);
    }
    i++;
  }
  elements.push(<React.Fragment key="C">{")"}</React.Fragment>);
  return <>{elements}</>;
};

export default MethodTypeComponent;
