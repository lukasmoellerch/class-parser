import { GetServerSideProps, NextPage } from "next";
import { RichContentNode } from "../../scripts/types";
import { InstructionData } from "../../utils/instruction-data";
import fs from "fs/promises";
import { renderRichContentArray } from "../../components/RichContent";

interface Props {
  data: InstructionData;
}

const InstructionPage: NextPage<Props> = ({ data: { name, sections } }) => {
  return (
    <div className="px-3 md:px-14 mx-auto max-w-screen-lg min-h-screen py-5 text-white">
      <h1 className="text-center mb-12 font-extrabold">{name}</h1>
      {sections.map(({ name, blocks }, index) => (
        <div key={index}>
          <h2 className="mt-12 mb-4 text-2xl font-bold">{name}</h2>
          {blocks.map(({ type, content }, index) => {
            if (type === "literallayout") {
              return (
                <div
                  key={index}
                  className="rounded p-3 text-lg border-green-100 border-2"
                >
                  {renderRichContentArray(content)}
                </div>
              );
            } else {
              return (
                <div key={index} className="mt-2 text-lg">
                  {renderRichContentArray(content)}
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props, { name: string }> =
  async ({ params: { name } }) => {
    const data = JSON.parse(
      (
        await fs.readFile(
          require.resolve(`../../public/instructions/${name}.json`)
        )
      ).toString()
    );
    return { props: { data } };
  };

export default InstructionPage;
