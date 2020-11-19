import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { FileExt, FileTypeConfig, FileTypes } from "../consts";

type UseStateSetter<T> = Dispatch<SetStateAction<T>>;

type OptionsPageProps = {
  hasFile: boolean;
  // Controls
  outputFileType: FileTypeConfig;
  setOutputFileType: UseStateSetter<FileTypeConfig>;
  size: string;
  setSize: UseStateSetter<string>;
  fps: string;
  setFps: UseStateSetter<string>;
  filename: string;
  setFilename: UseStateSetter<string>;
};

const EXTS: FileExt[] = ["gif", "mp4"];

/**
 * Options page
 */
export const OptionsPage: React.FC<OptionsPageProps> = ({
  hasFile,
  outputFileType,
  setOutputFileType,
}) => {
  if (!hasFile) return <div>Choose file first!</div>;

  return (
    <div>
      {/* File Type Selection */}
      <div>
        <select
          value={outputFileType?.ext}
          onChange={e =>
            setOutputFileType(
              FileTypes.find(t => t.ext === e.target.value) || FileTypes[0],
            )
          }
        >
          {FileTypes.map(type => (
            <option key={type.ext} value={type.ext}>
              {type.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
