export type FileExt = "gif" | "mp4";

export type FileTypeConfig = {
  ext: FileExt;
  mimeType: string;
  title: string;
};

export const FileTypes: FileTypeConfig[] = [
  {
    ext: "gif",
    mimeType: "image/gif",
    title: "GIF",
  },
  {
    ext: "mp4",
    mimeType: "video/mp4",
    title: "MP4",
  },
];
