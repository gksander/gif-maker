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
import { AnimatePresence } from "framer-motion";

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

  // Util
  const isFFMPEGReady = useLoadFFMPEG();
  const { videoUrl, setVideoFile, videoFile } = useLoadVideo();

  // Gif Handling
  const { convert, isConverting, outputUrl, outputSize } = useConvertFile({
    file: videoFile,
    size,
    fps,
    outputFileType,
  });
  const downloadFile = useDownloadFile({
    filename,
    url: outputUrl,
    ext: outputFileType.ext,
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
          <HeaderNav hasFile={!!videoFile} />
          <div className="p-4">
            <Route
              render={({ location }) => (
                <AnimatePresence exitBeforeEnter initial={false}>
                  <Switch location={location} key={location.pathname}>
                    <Route path={ROUTES.CHOOSE_FILE} exact>
                      <ChooseFilePage
                        videoUrl={videoUrl}
                        setVideoFile={setVideoFile}
                      />
                    </Route>
                    <Route path={ROUTES.CONVERSION_OPTIONS} exact>
                      <OptionsPage
                        hasFile={!!videoFile}
                        {...{
                          outputFileType,
                          setOutputFileType,
                          size,
                          setSize,
                          fps,
                          setFps,
                          filename,
                          setFilename,
                        }}
                      />
                    </Route>
                    <Route path={ROUTES.CONVERT} exact>
                      <ConvertPage
                        hasFile={!!videoFile}
                        {...{
                          convert,
                          outputUrl,
                          outputSize,
                          outputFileType,
                          isConverting,
                          downloadFile,
                          isFFMPEGReady,
                          filename,
                          setFilename,
                        }}
                      />
                    </Route>
                    <Route path={ROUTES.HOME}>
                      <HomePage />
                    </Route>
                  </Switch>
                </AnimatePresence>
              )}
            />
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
