import { IsString, IsOptional, MaxLength, IsNotEmpty, IsDateString, IsNumber, IsEnum } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(5)
  prefix?: string;
}

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  assetName: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsDateString()
  @IsOptional()
  warrantyExpiry?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class AssignAssetDto {
  @IsOptional()
  replaceExisting?: boolean;

  @IsOptional()
  @IsString()
  existingSerialNumber?: string;
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  hostname?: string;

  @IsString()
  @IsOptional()
  macAddress?: string;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  condition?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  swapAction?: string;
}

export class ShiftAssetDto {
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  hostname?: string;

  @IsString()
  @IsOptional()
  macAddress?: string;

  @IsString()
  @IsOptional()
  seatNumber?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAssetStatusDto {
  @IsEnum(['AVAILABLE', 'IN_MAINTENANCE', 'RETIRED', 'LOST'])
  status: 'AVAILABLE' | 'IN_MAINTENANCE' | 'RETIRED' | 'LOST';

  @IsString()
  @IsOptional()
  notes?: string;
}