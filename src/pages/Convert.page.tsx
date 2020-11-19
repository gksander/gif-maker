import * as React from "react";
import { FileTypeConfig } from "../consts";
import { PageTitle } from "../components/PageTitle";
import { Spacer } from "../components/Spacer";
import { Button } from "../components/Button";

type ConvertPageProps = {
  hasFile: boolean;
  convert: () => void;
  downloadFile: () => void;
  isConverting: boolean;
  outputUrl: string;
  outputSize: number;
  outputFileType: FileTypeConfig;
  isFFMPEGReady: boolean;
};

export const ConvertPage: React.FC<ConvertPageProps> = ({
  hasFile,
  outputFileType,
  convert,
  isConverting,
  outputUrl,
  outputSize,
  downloadFile,
  isFFMPEGReady,
}) => {
  if (!hasFile) return <div>Choose file first</div>;

  return (
    <div>
      <PageTitle>Convert the file!</PageTitle>
      <Spacer size="lg" />
      <Button onClick={convert} disabled={isConverting || !isFFMPEGReady}>
        Convert!
      </Button>
      <div>
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
