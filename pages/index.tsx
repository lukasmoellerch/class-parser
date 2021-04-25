import { NextPage } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import ClassPath from "../components/ClassPath";
import FieldComponent from "../components/Field";
import MethodComponent from "../components/Method";
import { ClassAccessFlags } from "../utils/access-flags-class";
import { parseClass } from "../utils/class-parser";

const getAccessName = (flags: ClassAccessFlags) => {
  if (flags.isPublic) return "public";
  return "default";
};

const IndexPage: NextPage = () => {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [data, setData] = useState<ArrayBuffer | undefined>(undefined);
  useEffect(() => {
    if (file === undefined) {
      setData(undefined);
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onloadend = () => {
      const result = fileReader.result;
      if (!(result instanceof ArrayBuffer)) return;
      setData(result);
    };
    return () => fileReader.abort();
  }, [file]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file === undefined) return;
    setFile(file);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const parsed = useMemo(() => (data ? parseClass(data) : undefined), [data]);
  return (
    <div className="bg-black py-10">
      <div className="px-1 md:px-10 mx-auto container min-h-screen">
        {file === undefined && (
          <div
            className="min-h-screen min-w-screen flex items-center justify-center"
            {...getRootProps()}
          >
            <div className="font-mono p-9 text-green-400 max-w-xl border-4 border-green-300 border-dashed rounded-lg">
              <h1 className="text-center mb-12 font-extrabold">class-parser</h1>
              <input {...getInputProps()} />

              {isDragActive ? (
                <p>Drop the file here ...</p>
              ) : (
                <p>Drag 'n' drop a class file here, or click to select one</p>
              )}
            </div>
          </div>
        )}

        {parsed && (
          <div className="font-mono text-white pt-10">
            <button
              onClick={() => setFile(undefined)}
              className="fixed top-2 right-0 p-2 text-2xl border-2 border-white border-opacity-60"
            >
              X
            </button>

            <div className="flex space-x-2 font-bold text-lg mb-20">
              <span className="px-1.5 py-0.5 bg-green-500 bg-opacity-30 rounded">
                {getAccessName(parsed.accessFlags)}
              </span>
              <span className="px-1.5 py-0.5">class</span>
              <span className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded">
                <ClassPath path={parsed.thisClass} />
              </span>
              <span className="px-1.5 py-0.5">extends</span>
              <span className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded">
                <ClassPath path={parsed.superClass} />
              </span>
              {parsed.interfaces.length > 0 && (
                <>
                  <span className="px-1.5 py-0.5">implements</span>
                  {parsed.interfaces.map((interfacePath, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-red-500 bg-opacity-30 rounded"
                    >
                      <ClassPath path={interfacePath} />
                    </span>
                  ))}
                </>
              )}
            </div>

            {parsed.fields.map((field) => (
              <FieldComponent
                key={field.name}
                field={field}
                constants={parsed.constants}
              />
            ))}
            {parsed.fields.length > 0 && <div className="mb-20" />}
            {parsed.methods.map((method) => (
              <MethodComponent
                key={method.name}
                method={method}
                constants={parsed.constants}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndexPage;
