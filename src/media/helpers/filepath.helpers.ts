export type FilePath = {
  email: string;
  fileType: string;
};

export type FileTypeMatcher = {
  fileType: string;
};

export const filePathHelpers = ({ email, fileType }: FilePath) => {
  let path = '';
  if (
    fileType.includes('image') ||
    fileType.includes('audio') ||
    fileType.includes('video')
  ) {
    path = `./uploads/${email}/${fileType}`;
  } else {
    path = `./uploads/${email}/others`;
  }
  return path;
};

export const fileTypeMatcherHelpers = ({ fileType }: FileTypeMatcher) => {
  let type = '';
  if (
    fileType.includes('image') ||
    fileType.includes('audio') ||
    fileType.includes('video')
  ) {
    type = fileType;
  } else {
    type = 'others';
  }
  return type;
};
