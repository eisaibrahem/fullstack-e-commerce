import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data: updateProductDto });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }

  async uploadImage(id: number, file: any) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    const { url, publicId } = await this.cloudinary.uploadImage(file, 'products');

    if (product.imagePublicId) {
      await this.cloudinary.deleteImage(product.imagePublicId).catch(() => {});
    }

    return this.prisma.product.update({
      where: { id },
      data: { image: url, imagePublicId: publicId },
    });
  }

  async deleteImage(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (product.imagePublicId) {
      await this.cloudinary.deleteImage(product.imagePublicId).catch(() => {});
    }

    return this.prisma.product.update({
      where: { id },
      data: { image: null, imagePublicId: null },
    });
  }
}
