import { BadRequestException } from '@nestjs/common';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from '../constants';

export const imageUploadOptions = {
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (
    _req: unknown,
    file: { mimetype: string },
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(new BadRequestException('Only JPEG, PNG, WebP, or GIF images are allowed'), false);
      return;
    }
    cb(null, true);
  },
};
