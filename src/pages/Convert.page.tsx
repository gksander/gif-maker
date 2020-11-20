import * as React from "react";
import { FileTypeConfig } from "../consts";
import { PageTitle } from "../components/PageTitle";
import { Spacer } from "../components/Spacer";
import { PageWrapper } from "../components/PageWrapper";
import { Redirect } from "react-router-dom";
import { ROUTES } from "../routes";
import { AnimatePresence, motion } from "framer-motion";
import { FaCogs } from "react-icons/all";
import { SetStateAction } from "react";

type ConvertPageProps = {
  hasFile: boolean;
  convert: () => void;
  downloadFile: () => void;
  isConverting: boolean;
  outputUrl: string;
  outputSize: number;
  filename: string;
  setFilename: React.Dispatch<SetStateAction<string>>;
  outputFileType: FileTypeConfig;
  isFFMPEGReady: boolean;
};

export const ConvertPage: React.FC<ConvertPageProps> = ({
  hasFile,
  outputFileType,
  convert,
  isConverting,
  outputUrl,
  downloadFile,
  isFFMPEGReady,
  filename,
  setFilename,
}) => {
  return (
    <div>
      <PageTitle>Convert the file!</PageTitle>
      <Spacer size="lg" />
      <PageWrapper>
        {!hasFile && <Redirect to={ROUTES.CHOOSE_FILE} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            className="border-2 border-primary-700 text-primary-700 rounded flex flex-col justify-center items-center"
            onClick={convert}
            disabled={isConverting || !isFFMPEGReady}
          >
            <FaCogs className="text-5xl" />
            <Spacer size="sm" />
            <span className="font-bold">Convert!</span>
          </button>
          <div>
            <div className="aspect-w-16 aspect-h-9 border-2 rounded relative">
              {(() => {
                if (isConverting) return <div>Converting...</div>;
                if (!outputUrl) return <div>Hit that button</div>;
                if (outputFileType.ext === "gif") {
                  return (
                    <img
                      src={outputUrl}
                      width="100%"
                      className="absolute inset-0"
                      alt="Preview of output"
                    />
                  );
                }

                return (
                  <video
                    src={outputUrl}
                    width="100%"
                    className="absolute inset-0"
                    controls
                  />
                );
              })()}
            </div>
          </div>
          <AnimatePresence initial={false}>
            {outputUrl && (
              <motion.div
                className="sm:col-span-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex rounded overflow-hidden">
                  <button
                    className="w-1/2 bg-primary-700 text-white"
                    onClick={downloadFile}
                  >
                    Download
                  </button>
                  <input
                    type="text"
                    className="flex-1 border-gray-50 text-right text-gray-800"
                    value={filename}
                    onChange={e => setFilename(e.target.value)}
                  />
                  <span className="w-24 flex justify-center items-center bg-gray-50 text-gray-500">
                    .{outputFileType.ext}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageWrapper>
    </div>
  );
};
