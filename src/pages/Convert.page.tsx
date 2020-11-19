import * as React from "react";
import { FileTypeConfig } from "../consts";

type ConvertPageProps = {
  hasFile: boolean;
  convert: () => void;
  downloadFile: () => void;
  isConverting: boolean;
  outputUrl: string;
  outputSize: number;
  outputFileType: FileTypeConfig;
};

export const ConvertPage: React.FC<ConvertPageProps> = ({
  hasFile,
  outputFileType,
  convert,
  isConverting,
  outputUrl,
  outputSize,
  downloadFile,
}) => {
  if (!hasFile) return <div>Choose file first</div>;

  return (
    <div>
      <div>
        <button onClick={convert}>Convert!</button>
        {isConverting && <div>Converting</div>}
        {outputUrl && (
          <div>
            <div>
              {outputFileType.ext === "gif" ? (
                <img src={outputUrl} width="250" />
              ) : (
                <video src={outputUrl} width="250" controls />
              )}
              <div>Size: {outputSize} mb</div>
              <button onClick={downloadFile}>Download!</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
