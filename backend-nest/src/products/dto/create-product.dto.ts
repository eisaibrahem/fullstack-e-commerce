import { IsString, IsNotEmpty, IsNumber, IsPositive, IsInt, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  image?: string;
}
