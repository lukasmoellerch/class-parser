interface Props {
  children: string;
}
const Identifier: React.FC<Props> = ({ children }) => {
  return <span className="text-yellow-200 font-semibold">{children}</span>;
};

export default Identifier;
