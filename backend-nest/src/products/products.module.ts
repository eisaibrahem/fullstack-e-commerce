import { Module } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { ProductsController } from './products.controller.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [CloudinaryModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
