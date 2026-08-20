import { IsEmail, IsNotEmpty, IsString, MinLength, IsArray, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSubAdminDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray({ message: 'Departments must be an array' })
  @ArrayMinSize(1, { message: 'At least one department must be selected' })
  departmentIds: string[];
}
