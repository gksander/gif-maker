import * as React from "react";
import { Dispatch, SetStateAction } from "react";

type UseStateSetter<T> = Dispatch<SetStateAction<T>>;

type GifPageProps = {
  hasFile: boolean;
  convert: () => void;
  downloadFile: () => void;
  gifUrl: string;
  gifSize: number | null;
  isConverting: boolean;
  // Controls
  size: string;
  setSize: UseStateSetter<string>;
  fps: string;
  setFps: UseStateSetter<string>;
  filename: string;
  setFilename: UseStateSetter<string>;
};

export const GifPage: React.FC<GifPageProps> = ({
  hasFile,
  convert,
  gifUrl,
  gifSize,
  isConverting,
  downloadFile,
  size,
  setSize,
  fps,
  setFps,
  filename,
  setFilename,
}) => {
  // No file? placeholder
  if (!hasFile) return <div>Upload file first!</div>;

  if (isConverting) return <div>WORKING!</div>;

  // Markup
  return (
    <div>
      <button onClick={convert}>Convert!</button>
      <div>
        <input
          type="number"
          value={size}
          onChange={e => setSize(e.target.value)}
        />
      </div>
      <div>
        <input
          type="number"
          value={fps}
          onChange={e => setFps(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          value={filename}
          onChange={e => setFilename(e.target.value)}
        />
      </div>
      {gifUrl && (
        <div>
          <img src={gifUrl} width="250" />
          <p>Gif size: {gifSize} mb</p>
          <button onClick={downloadFile}>Download</button>
        </div>
      )}
    </div>
  );
};
