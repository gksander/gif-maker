import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { FileExt, FileTypeConfig, FileTypes } from "../consts";
import { PageTitle } from "../components/PageTitle";
import { Spacer } from "../components/Spacer";
import { FancySelect } from "../components/FancySelect";
import { FancyInput } from "../components/FancyInput";

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
  filename,
  setFilename,
  size,
  setSize,
  fps,
  setFps,
}) => {
  // S TODO: Need a generic thing for this.
  if (!hasFile) return <div>Choose file first!</div>;

  return (
    <div>
      <PageTitle>Conversion Options</PageTitle>
      <Spacer />
      <FancySelect
        title="File Type"
        options={FileTypes.map(t => ({ title: t.title, value: t.ext }))}
        value={outputFileType.ext}
        onSelect={v =>
          setOutputFileType(FileTypes.find(t => t.ext === v) || FileTypes[0])
        }
      />
      {outputFileType.ext === "gif" && (
        <React.Fragment>
          <Spacer size="lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FancyInput
              title="Size (px)"
              type="number"
              value={size}
              onChange={e => setSize((e.target as HTMLInputElement).value)}
            />
            <FancyInput
              title="FPS"
              type="number"
              value={fps}
              onChange={e => setFps((e.target as HTMLInputElement).value)}
            />
          </div>
        </React.Fragment>
      )}
    </div>
  );
};
