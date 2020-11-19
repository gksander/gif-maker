import * as React from "react";

type ChooseFilePageProps = {
  videoUrl: string;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const ChooseFilePage: React.FC<ChooseFilePageProps> = ({
  videoUrl,
  onFileInputChange,
}) => {
  return (
    <div>
      {videoUrl && <video controls width="250" src={videoUrl} />}
      <input type="file" onChange={onFileInputChange} />
    </div>
  );
};
