import * as React from "react";
import { Grid, GridItem } from "@chakra-ui/react";
import { Route, Switch } from "react-router-dom";
import { Header } from "./components/Header";
import { ROUTES } from "./routes";
import { GifPage } from "./pages/Gif.page";
import { Mp4Page } from "./pages/Mp4.page";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg({ log: true });

/**
 * Our actual App
 */
export const App: React.FC = () => {
  // Local state
  const [size, setSize] = React.useState("250");
  const [fps, setFps] = React.useState("30");
  const [filename, setFilename] = React.useState("mygif");

  // Util
  const isFFMPEGReady = useLoadFFMPEG();
  const { videoUrl, onFileInputChange, videoFile } = useLoadVideo();

  // Gif Handling
  const {
    convert: convertToGif,
    isConverting,
    outputUrl: gifUrl,
    outputSize: gifSize,
  } = useConvertFile({
    file: videoFile,
    size,
    fps,
    ext: "gif",
  });
  const downloadGif = useDownloadFile({ filename, url: gifUrl, ext: "gif" });

  // Mp4 Handling
  // Gif Handling
  const {
    convert: convertToMp4,
    isConverting: isConvertingMp4,
    outputUrl: mp4Url,
    outputSize: mp4Size,
  } = useConvertFile({
    file: videoFile,
    size,
    fps,
    ext: "mp4",
  });
  const downloadMp4 = useDownloadFile({ filename, url: mp4Url, ext: "mp4" });

  // Loading screen while we wait for FFMPEG?
  if (!isFFMPEGReady) return <div>LOADING!</div>;

  // Main markup
  return (
    <React.Fragment>
      <Header />
      <Grid gap={6} templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]}>
        <GridItem>
          {videoUrl && <video controls width="250" src={videoUrl} />}
          <input type="file" onChange={onFileInputChange} />
        </GridItem>
        <GridItem>
          <Switch>
            <Route path={ROUTES.MP4}>
              <Mp4Page
                hasFile={!!videoFile}
                isConverting={isConvertingMp4}
                convert={convertToMp4}
                download={downloadMp4}
                mp4Url={mp4Url}
                mp4Size={mp4Size}
                filename={filename}
                setFilename={setFilename}
              />
            </Route>
            <Route path={ROUTES.HOME}>
              <GifPage
                hasFile={!!videoFile}
                convert={convertToGif}
                downloadFile={downloadGif}
                gifUrl={gifUrl}
                gifSize={gifSize}
                isConverting={isConverting}
                size={size}
                setSize={setSize}
                fps={fps}
                setFps={setFps}
                filename={filename}
                setFilename={setFilename}
              />
            </Route>
          </Switch>
        </GridItem>
      </Grid>
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

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (file) setVideoFile(file);
  };

  return { onFileInputChange, videoFile, videoUrl };
};

/**
 * Hook for converting to GIF
 */
export const useConvertFile = ({
  file,
  size,
  fps,
  ext,
}: {
  file: File | null;
  size: string;
  fps: string;
  ext: string;
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

      const outputFileName = `output.${ext}`;
      const outputFileType = /gif/i.test(ext) ? "image/gif" : "video/mp4";

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
      setOutputBlob(new Blob([data.buffer], { type: outputFileType }));

      // Get the size
      setOutputSize(
        ((await ffmpeg.FS("stat", outputFileName)?.size) || 0) /
          Math.pow(10, 6),
      );
    } catch (e) {
      console.log(e);
    }

    setIsConverting(false);
  }, [cleanedFps, cleanedSize, file, isConverting]);

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
