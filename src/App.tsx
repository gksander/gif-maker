import * as React from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FileExt, FileTypes } from "./consts";
import { AnimatePresence, motion } from "framer-motion";
import { PageTitle } from "./components/PageTitle";
import { Spacer } from "./components/Spacer";
import { FancySelect } from "./components/FancySelect";
import { FancyInput } from "./components/FancyInput";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { FaFileImport } from "react-icons/all";
import { LoadingClock } from "./components/LoadingClock";
import { useLocallyStoredState } from "./useLocallyStoredState";
import { AlertMessage } from "./components/AlertMessage";
import { formatBytes } from "./formatBytes";

const ffmpeg = createFFmpeg({ log: true });

/**
 * Our actual App
 */
export const App: React.FC = () => {
  // Local state
  const [size, setSize] = useLocallyStoredState("size", "500");
  const [fps, setFps] = useLocallyStoredState("fps", "15");
  const [outputFileExt, setOutputFileExt] = useLocallyStoredState<FileExt>(
    "fileext",
    FileTypes[0].ext,
  );
  const outputFileType = React.useMemo(
    () => FileTypes.find(t => t.ext === outputFileExt) || FileTypes[0],
    [outputFileExt],
  );
  const [isConverting, setIsConverting] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState("");
  const [previewUrl, setPreviewUrl] = React.useState("");
  const revokePreview = React.useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  // Util
  const isFFMPEGReady = useLoadFFMPEG();

  // File drop handling
  const onDrop = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || isConverting) return;

      let outputUrl = "";
      revokePreview();
      try {
        setIsConverting(true);
        setAlertMessage("");

        const cleanedSize = (() => {
          const s = parseInt(size) || 0;
          return s <= 0 ? 200 : s;
        })();
        const cleanedFps = (() => {
          const f = parseInt(fps) || 0;
          return f <= 0 ? 15 : f;
        })();

        // Write the file to memory (so FFMPEG can operate on it)
        await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

        const ext = outputFileType.ext;
        const outputFileName = file.name.replace(/\.[^.]+$/, `.${ext}`);

        // Do the converstion
        if (ext === "gif") {
          await ffmpeg.run(
            "-i",
            "input.mp4",
            "-vf",
            `fps=${cleanedFps},scale=${cleanedSize}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
            outputFileName,
          );
        } else if (ext === "mp4") {
          await ffmpeg.run("-i", "input.mp4", outputFileName);
        }

        // Generate output URL for download
        const data = ffmpeg.FS("readFile", outputFileName);
        const outputBlob = new Blob([data.buffer], {
          type: outputFileType.mimeType,
        });
        outputUrl = URL.createObjectURL(outputBlob);
        if (ext === "gif") {
          setPreviewUrl(outputUrl);
        }

        const fileSize = await (async () => {
          try {
            // const size = ((await ffmpeg.FS("stat", outputFileName)?.size) ||
            //   0) as number;
            const size = 0;

            return formatBytes(size);
          } catch {
            return "---";
          }
        })();

        // Handle downloading
        const downloadFile = () => {
          const link = document.createElement("a");
          link.href = outputUrl;
          link.download = outputFileName;

          document.body.appendChild(link);
          link.dispatchEvent(new MouseEvent("click", { bubbles: false }));

          // S TODO: This should happen in a "finally" for safety
          document.body.removeChild(link);
        };

        downloadFile();
        setAlertMessage(
          `Check your downloads. A ${fileSize} file should have been downloaded.`,
        );
      } catch (e) {
        console.log(e);
        setAlertMessage(
          "Something went wrong during the conversion process. Try again.",
        );
      } finally {
        // URL.revokeObjectURL(outputUrl);
        setIsConverting(false);
      }
    },
    [
      fps,
      isConverting,
      outputFileType.ext,
      outputFileType.mimeType,
      revokePreview,
      size,
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: ["video/mp4", "video/mov", "video/*", "image/gif"],
    disabled: !isFFMPEGReady,
  });

  // Main markup
  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="bg-gradient-to-b from-primary-700 to-primary-500 text-white font-thin pb-24">
          <div className="container max-w-3xl py-12 px-2">
            <div className="text-5xl font-serif font-bold">GifMaker</div>
            <div className="max-w-xl text-lg">
              Convert your video files <strong>inside this browser tab</strong>.
              All local. No trips to the server.
            </div>
          </div>
        </div>
        <div className="container max-w-3xl px-2 -mt-24">
          <div className="bg-white rounded shadow-lg">
            <div className="p-4">
              <PageTitle>Conversion Options</PageTitle>
              <Spacer />
              {/* Configuration Options*/}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <FancySelect
                    title="Output File Type"
                    options={FileTypes.map(t => ({
                      title: t.title,
                      value: t.ext,
                    }))}
                    value={outputFileType.ext}
                    onSelect={v => setOutputFileExt(v as FileExt)}
                  />
                </div>
                <AnimatePresence initial={false}>
                  {outputFileType.ext === "gif" && (
                    <motion.div
                      className="sm:col-span-2 grid sm:grid-cols-2 gap-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <FancyInput
                        title="Width"
                        type="number"
                        value={size}
                        onChange={e =>
                          setSize((e.target as HTMLInputElement).value)
                        }
                        suffix="px"
                      />
                      <FancyInput
                        title="FPS"
                        type="number"
                        value={fps}
                        onChange={e =>
                          setFps((e.target as HTMLInputElement).value)
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* End Configuration */}
              <Spacer size="xl" />
              {/* Dropper */}
              <PageTitle>Choose File</PageTitle>
              <Spacer />
              <div
                {...getRootProps()}
                className={classNames(
                  "border-2 border-primary-700 rounded p-3 overflow-hidden flex flex-col justify-center items-center transition-all duration-150 hover:bg-gray-50",
                  isDragActive && "shadow-inner",
                  !isFFMPEGReady ? "opacity-50 cursor-wait" : "cursor-pointer",
                )}
              >
                <input {...getInputProps()} />
                {!isFFMPEGReady ? (
                  <React.Fragment>
                    <div className="w-16">
                      <LoadingClock />
                    </div>
                    <Spacer size="sm" />
                    <div className="font-bold text-primary-700">
                      Loading FFMPEG...
                    </div>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <motion.div
                      className={classNames(
                        "rounded-full w-20 h-20 bg-primary-100 flex justify-center items-center transition-colors duration-150",
                        isDragActive
                          ? "bg-primary-700 text-white"
                          : "text-primary-700",
                      )}
                      animate={{
                        scale: isDragActive ? 0.9 : 1,
                      }}
                    >
                      <FaFileImport className="text-3xl" />
                    </motion.div>
                    <Spacer />
                    <div className="font-bold text-primary-700">
                      Drop a file here
                    </div>
                  </React.Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isConverting && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center text-primary-700 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="p-3 bg-white rounded shadow-lg w-64"
              initial={{ y: 20 }}
              animate={{ y: 0, transition: { duration: 0.5 } }}
              exit={{ y: 20 }}
            >
              <div className="mx-auto w-32">
                <LoadingClock />
              </div>
              <Spacer />
              <span className="font-bold">Converting file...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Alert/toast */}
      <AnimatePresence initial={false}>
        {!!alertMessage && (
          <motion.div
            className="fixed bottom-3 left-3 right-3 sm:right-1/3 lg:right-1/2 xl:right-2/3"
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3 },
            }}
            exit={{
              opacity: 0,
              y: 50,
              scale: 0.8,
              transition: { duration: 0.3 },
            }}
          >
            <AlertMessage
              message={alertMessage}
              onDismiss={() => {
                revokePreview();
                setAlertMessage("");
              }}
              previewUrl={previewUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

/**
 * Load in FFMPEG
 */
export const useLoadFFMPEG = () => {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let isSubscribed = true;
    ffmpeg.load().then(() => isSubscribed && setIsReady(true));

    return () => {
      isSubscribed = false;
    };
  }, []);

  return isReady;
};
