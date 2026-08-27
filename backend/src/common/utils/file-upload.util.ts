import { BadRequestException } from '@nestjs/common';

export const imageUploadOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Unsupported file type: ' + file.mimetype), false);
    }
  }
};
