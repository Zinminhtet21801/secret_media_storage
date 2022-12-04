export type FilePath = {
  email: string;
  mimeType: string;
};

export type FileTypeMatcher = {
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

export const fileTypeMatcherHelpers = ({ mimeType }: FileTypeMatcher) => {
  let type = '';
  if (
    mimeType.includes('image') ||
    mimeType.includes('audio') ||
    mimeType.includes('video')
  ) {
    type = mimeType;
  } else {
    type = 'others';
  }
  return type;
};
