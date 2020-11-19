import * as React from "react";
import { Dispatch, SetStateAction } from "react";

type Mp4PageProps = {
  hasFile: boolean;
  isConverting: boolean;
  convert: () => void;
  download: () => void;
  mp4Url: string;
  mp4Size: number;
  filename: string;
  setFilename: Dispatch<SetStateAction<string>>;
};

export const Mp4Page: React.FC<Mp4PageProps> = ({
  hasFile,
  isConverting,
  convert,
  download,
  mp4Url,
  mp4Size,
  filename,
  setFilename,
}) => {
  if (!hasFile) return <div>Upload file first!</div>;

  if (isConverting) return <div>Working!</div>;

  return (
    <div>
      <button onClick={convert}>Convert!</button>
      <div>
        <input
          type="text"
          value={filename}
          onChange={e => setFilename(e.target.value)}
        />
      </div>
      {mp4Url && (
        <div>
          <video src={mp4Url} width="250" controls>
            <source src={mp4Url} />
          </video>
          <p>Mp4 size: {mp4Size} mb</p>
          <button onClick={download}>Download</button>
        </div>
      )}
    </div>
  );
};
