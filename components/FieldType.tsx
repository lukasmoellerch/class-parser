import { FieldType } from "../utils/field-descriptor-parser";
import ClassPath from "./ClassPath";

interface Props {
  type: FieldType;
}

const FieldTypeComponent: React.FC<Props> = ({ type }) => {
  if (typeof type === "string") {
    return <span className="text-purple-300">{type}</span>;
  } else if (type.type === "reference") {
    return <ClassPath path={type.className} />;
  } else {
    return (
      <>
        <FieldTypeComponent type={type.componentType} />
        []
      </>
    );
  }
};

export default FieldTypeComponent;
