import * as React from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { ChakraProvider, Grid, theme, GridItem } from "@chakra-ui/react";

// Util
const ffmpeg = createFFmpeg({ log: true });

/**
 * Our actual App
 */
export const App: React.FC = () => {
  const isFFMPEGReady = useLoadFFMPEG();
  const { videoUrl, onFileInputChange, videoFile } = useLoadVideo();
  const { gifUrl, gifSize, convertToGif } = useConvertToGif({
    file: videoFile,
  });
  const downloadFile = useDownloadFile({ gifUrl, filename: "mygif.gif" });

  if (!isFFMPEGReady) return <div>LOADING!</div>;

  return (
    <ChakraProvider theme={theme}>
      <Grid gap={6} templateColumns={["repeat(1, 1fr)", "repeat(2, 1fr)"]}>
        <GridItem>
          {videoUrl && <video controls width="250" src={videoUrl} />}
          <input type="file" onChange={onFileInputChange} />
        </GridItem>
        <GridItem>
          {videoUrl ? (
            <div>
              <button onClick={convertToGif}>Convert!</button>
              {gifUrl && (
                <div>
                  <img src={gifUrl} width="250" />
                  <p>Gif size: {gifSize} bytes</p>
                  <button onClick={downloadFile}>Download</button>
                </div>
              )}
            </div>
          ) : (
            <div>Upload video first</div>
          )}
        </GridItem>
      </Grid>
    </ChakraProvider>
  );
};

/**
 * Load in FFMPEG
 */
const useLoadFFMPEG = () => {
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
const useLoadVideo = () => {
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
const useConvertToGif = ({ file }: { file: File | null }) => {
  const [isConverting, setIsConverting] = React.useState(false);
  const [gifBlob, setGifBlob] = React.useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = React.useState("");
  const [gifSize, setGifSize] = React.useState(0);

  // Method to convert
  const convertToGif = React.useCallback(async () => {
    if (!file || isConverting) return;

    setIsConverting(true);

    try {
      // Write the file to memory (so FFMPEG can operate on it)
      await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(file));

      // Run the convert command
      await ffmpeg.run("-i", "input.mp4", "-f", "gif", "output.gif");

      // Read the result
      const data = ffmpeg.FS("readFile", "output.gif");
      setGifBlob(new Blob([data.buffer], { type: "image/gif" }));

      // Get the size
      setGifSize((await ffmpeg.FS("stat", "output.gif")?.size) || 0);
    } catch (e) {
      console.log(e);
    }

    setIsConverting(false);
  }, [file, isConverting]);

  // Managing image url
  React.useEffect(() => {
    if (gifBlob) {
      const url = URL.createObjectURL(gifBlob);
      setGifUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setGifUrl("");
    }
  }, [gifBlob]);

  // If file changes, we should wipe this data.
  React.useEffect(() => {
    if (file) {
      setGifBlob(null);
      setGifSize(0); // S TODO: This could be its own effect
    }
  }, [file]);

  return { convertToGif, isConverting, gifUrl, gifSize };
};

/**
 * Method to download file
 */
const useDownloadFile = ({ gifUrl = "", filename = "" }) => {
  return React.useCallback(() => {
    const link = document.createElement("a");
    link.href = gifUrl;
    link.download = filename;

    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent("click", { bubbles: false }));

    document.body.removeChild(link);
  }, [filename, gifUrl]);
};
