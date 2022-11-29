export type FilePath = {
  email: string;
  mimeType: string;
};

export const filePathHelpers = ({ email, mimeType }: FilePath) => {
  let path = '';
  if (
    mimeType.includes('image') ||
    mimeType.includes('audio') ||
    mimeType.includes('video')
  ) {
    path = `./uploads/${email}/${mimeType}`;
  } else {
    path = `./uploads/${email}/others`;
  }
  return path;
};
