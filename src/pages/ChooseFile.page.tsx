import * as React from "react";
import { PageTitle } from "../components/PageTitle";
import { Spacer } from "../components/Spacer";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { FaFileImport } from "react-icons/all";
import { AnimatePresence, motion, Variants } from "framer-motion";

type ChooseFilePageProps = {
  videoUrl: string;
  setVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
};

const DropTextVariants: Variants = {};

/**
 * Choosing file
 */
export const ChooseFilePage: React.FC<ChooseFilePageProps> = ({
  videoUrl,
  setVideoFile,
}) => {
  const onDrop = React.useCallback(
    (files: File[]) => {
      if (!files[0]) return;
      setVideoFile(files[0]);
    },
    [setVideoFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: ["video/mp4", "video/mov", "video/*"],
  });

  return (
    <div>
      <PageTitle>Choose a File</PageTitle>
      <Spacer size="lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          {...getRootProps()}
          className={classNames(
            "border-2 rounded p-3 overflow-hidden flex flex-col justify-center items-center transition-all duration-150 cursor-pointer hover:bg-gray-50",
            isDragActive && "shadow-inner",
          )}
        >
          <input {...getInputProps()} />
          <motion.div
            className={classNames(
              "rounded-full w-20 h-20 border-primary-700 border-2 flex justify-center items-center transition-colors duration-150",
              isDragActive ? "bg-primary-700 text-white" : "text-primary-700",
              !videoUrl && "animate-pulse",
            )}
            animate={{
              scale: isDragActive ? 0.9 : 1,
            }}
          >
            <FaFileImport className="text-3xl" />
          </motion.div>
          <Spacer />
          <div className="font-bold text-primary-700">
            {isDragActive ? (
              <span>Drop file</span>
            ) : videoUrl ? (
              <span>Change video</span>
            ) : (
              <span>Choose file</span>
            )}
          </div>
        </div>
        <div>
          <div className="aspect-w-16 aspect-h-9 border-2 rounded overflow-hidden relative">
            <AnimatePresence>
              {videoUrl && (
                <motion.video
                  controls
                  className="absolute inset-0"
                  width="100%"
                  src={videoUrl}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
