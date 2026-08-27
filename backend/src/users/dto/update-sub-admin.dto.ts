import { IsString, IsEmail, IsArray, IsOptional } from 'class-validator';

export class UpdateSubAdminDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsArray()
  @IsOptional()
  departmentIds?: string[];
}
