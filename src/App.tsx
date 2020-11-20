import * as React from "react";
import { Route, Switch } from "react-router-dom";
import { ROUTES } from "./routes";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { HomePage } from "./pages/Home.page";
import { ChooseFilePage } from "./pages/ChooseFile.page";
import { OptionsPage } from "./pages/Options.page";
import { ConvertPage } from "./pages/Convert.page";
import { FileTypeConfig, FileTypes } from "./consts";
import { HeaderNav } from "./components/HeaderNav";
import { AnimatePresence, motion } from "framer-motion";
import { PageTitle } from "./components/PageTitle";
import { Spacer } from "./components/Spacer";
import { FancySelect } from "./components/FancySelect";
import { FancyInput } from "./components/FancyInput";
import { PageWrapper } from "./components/PageWrapper";
import { useDropzone } from "react-dropzone";
import classNames from "classnames";
import { FaFileImport } from "react-icons/all";

const ffmpeg = createFFmpeg({ log: true });

/**
 * Our actual App
 */
export const App: React.FC = () => {
  // Local state
  const [size, setSize] = React.useState("250");
  const [fps, setFps] = React.useState("30");
  const [outputFileType, setOutputFileType] = React.useState<FileTypeConfig>(
    FileTypes[0],
  );
  const [filename, setFilename] = React.useState("myfile");
  const [isConverting, setIsConverting] = React.useState(false);

  // Util
  const isFFMPEGReady = useLoadFFMPEG();
  const { videoUrl, setVideoFile, videoFile } = useLoadVideo();

  // Gif Handling
  // const { convert, outputUrl, outputSize } = useConvertFile({
  //   file: videoFile,
  //   size,
  //   fps,
  //   outputFileType,
  // });
  // const downloadFile = useDownloadFile({
  //   filename,
  //   url: outputUrl,
  //   ext: outputFileType.ext,
  // });

  // File drop handling
  const onDrop = React.useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || isConverting) return;

      let outputUrl = "";
      try {
        setIsConverting(true);

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
        const outputFileName = `output.${ext}`;

        // Do the converstion
        if (ext === "gif") {
          await ffmpeg.run(
            "-i",
            "input.mp4",
            "-vf",
            `fps=${cleanedFps},scale=${cleanedSize}:-1`,
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

        // Handle downloading
        const link = document.createElement("a");
        link.href = outputUrl;
        link.download = `${filename}.${ext}`;

        document.body.appendChild(link);
        link.dispatchEvent(new MouseEvent("click", { bubbles: false }));

        // S TODO: This should happen in a "finally" for safety
        document.body.removeChild(link);
      } catch {
      } finally {
        URL.revokeObjectURL(outputUrl);
        setIsConverting(false);
      }
    },
    [
      filename,
      fps,
      isConverting,
      outputFileType.ext,
      outputFileType.mimeType,
      size,
    ],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: ["video/mp4", "video/mov", "video/*"],
  });

  // Main markup
  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      <div className="bg-gradient-to-b from-primary-700 to-primary-500 text-white font-thin pb-24">
        <div className="container max-w-3xl py-12 px-2">
          <div className="text-5xl font-bold">Video Converter</div>
        </div>
      </div>
      <div className="container max-w-3xl px-2 -mt-24">
        <div className="bg-white rounded shadow-lg">
          <div className="p-4">
            <PageTitle>Conversion Options</PageTitle>
            <Spacer />
            {/* Configuration Options*/}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FancySelect
                title="File Type"
                options={FileTypes.map(t => ({ title: t.title, value: t.ext }))}
                value={outputFileType.ext}
                onSelect={v =>
                  setOutputFileType(
                    FileTypes.find(t => t.ext === v) || FileTypes[0],
                  )
                }
              />
              <FancyInput
                title="Output Filename"
                type="text"
                suffix={`.${outputFileType.ext}`}
                value={filename}
                onChange={e =>
                  setFilename((e.target as HTMLInputElement).value)
                }
              />
              <AnimatePresence initial={false}>
                {outputFileType.ext === "gif" && (
                  <motion.div
                    className="sm:col-span-2 grid sm:grid-cols-2 gap-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
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
                "border-2 border-primary-700 rounded p-3 overflow-hidden flex flex-col justify-center items-center transition-all duration-150 cursor-pointer hover:bg-gray-50",
                isDragActive && "shadow-inner",
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                className={classNames(
                  "rounded-full w-20 h-20 border-primary-700 border-2 flex justify-center items-center transition-colors duration-150",
                  isDragActive
                    ? "bg-primary-700 text-white"
                    : "text-primary-700",
                  !videoUrl && "",
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
          </div>
        </div>
      </div>
    </div>
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

/**
 * Handle loading video
 */
export const useLoadVideo = () => {
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [videoUrl, setVideoUrl] = React.useState("");

  React.useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoUrl("");
    }
  }, [videoFile]);

  return { videoFile, setVideoFile, videoUrl };
};

/**
 * Hook for converting to GIF
 */
export const useConvertFile = ({
  file,
  size,
  fps,
  outputFileType,
}: {
  file: File | null;
  size: string;
  fps: string;
  outputFileType: FileTypeConfig;
}) => {
  const [isConverting, setIsConverting] = React.useState(false);
  const [outputBlob, setOutputBlob] = React.useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = React.useState("");
  const [outputSize, setOutputSize] = React.useState(0);

  // Cleaned values
  const cleanedSize = React.useMemo(() => {
    const s = parseInt(size) || 0;
    return s <= 0 ? 200 : s;
  }, [size]);
  const cleanedFps = React.useMemo(() => {
    const f = parseInt(fps) || 0;
    return f <= 0 ? 15 : f;
  }, [fps]);

  // Method to convert
  const convert = React.useCallback(async () => {
    if (!file || isConverting) return;

    setIsConverting(true);

    try {
      // Write the file to memory (so FFMPEG can operate on it)
      await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

      const ext = outputFileType.ext;
      const outputFileName = `output.${ext}`;

      if (/gif/i.test(ext)) {
        // Run the convert command
        await ffmpeg.run(
          "-i",
          "input.mp4",
          "-vf",
          `fps=${cleanedFps},scale=${cleanedSize}:-1`,
          outputFileName,
        );
      } else if (/mp4/i.test(ext)) {
        await ffmpeg.run("-i", "input.mp4", outputFileName);
      }

      // Read the result
      const data = ffmpeg.FS("readFile", outputFileName);
      setOutputBlob(new Blob([data.buffer], { type: outputFileType.mimeType }));

      // Get the size
      setOutputSize(
        ((await ffmpeg.FS("stat", outputFileName)?.size) || 0) /
          Math.pow(10, 6),
      );
    } catch (e) {
      console.log(e);
    }

    setIsConverting(false);
  }, [cleanedFps, cleanedSize, outputFileType, file, isConverting]);

  // Managing image url
  React.useEffect(() => {
    if (outputBlob) {
      const url = URL.createObjectURL(outputBlob);
      setOutputUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setOutputUrl("");
    }
  }, [outputBlob]);

  // If file changes, we should wipe this data.
  React.useEffect(() => {
    if (file) {
      setOutputBlob(null);
      setOutputSize(0); // S TODO: This could be its own effect
    }
  }, [file]);

  return { convert, isConverting, outputUrl, outputSize };
};

/**
 * Method to download file
 */
export const useDownloadFile = ({
  filename,
  url,
  ext,
}: {
  filename: string;
  ext: string;
  url: string;
}) => {
  return React.useCallback(() => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${ext}`;

    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent("click", { bubbles: false }));

    document.body.removeChild(link);
  }, [ext, filename, url]);
};
