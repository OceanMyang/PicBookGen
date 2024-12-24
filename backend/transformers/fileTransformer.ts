import { z } from 'zod';
import { BadRequestException, DataNotFoundException } from '../utils/error.util';

const fileSchema = z.object({
  fileid: z.string().uuid(),
  name: z.string(),
  author: z.string(),
  createdat: z.coerce.date(),
  deletedat: z.coerce.date().nullable(),
});

const filesSchema = z.array(fileSchema);

export function fileTransformer(file: JSON): FileData {
  try {
    return { ...fileSchema.parse(file) };
  }
  catch (err) {
    throw new BadRequestException("File data is invalid.");
  }
}

export function filesTransformer(files: JSON[]): FileData[] {
  try {
    return filesSchema.parse(files);
  }
  catch (err) {
    throw new BadRequestException("File data is invalid.");
  }
}