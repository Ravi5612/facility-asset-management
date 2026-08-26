import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional, IsDateString, IsNumberString, IsNumber } from 'class-validator';

export class CreateEmployeeUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsNotEmpty()
  designation: string;

  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  // --- NEW FIELDS ---
  @IsOptional() @IsString() fatherName?: string;
  @IsOptional() @IsString() motherName?: string;
  @IsOptional() @IsString() dob?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() bloodGroup?: string;
  @IsOptional() @IsString() emergencyContact?: string;
  @IsOptional() @IsString() currentAddress?: string;
  @IsOptional() @IsString() permanentAddress?: string;
  @IsOptional() @IsString() qualification?: string;
  
  @IsOptional() lastSalary?: any;
  @IsOptional() offeredSalary?: any;

  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsString() accountNumber?: string;
  @IsOptional() @IsString() ifscCode?: string;
  @IsOptional() @IsString() aadharNumber?: string;
  
  @IsOptional() @IsString() criminalCase?: string;
  @IsOptional() @IsString() criminalDetails?: string;
  @IsOptional() @IsString() illnesses?: string;
  @IsOptional() @IsString() medication?: string;

  @IsOptional() @IsString() aadharPhoto?: string;
  @IsOptional() @IsString() educationPhoto?: string;
  @IsOptional() @IsString() salaryProofPhoto?: string;
}
