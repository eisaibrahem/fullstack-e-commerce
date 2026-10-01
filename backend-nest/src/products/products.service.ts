import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import { parsePagination, buildMeta } from '../common/pagination.js';

export interface ProductQuery {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

const SORT_OPTIONS: Record<string, Prisma.ProductOrderByWithRelationInput[]> = {
  newest: [{ updatedAt: 'desc' }, { id: 'desc' }],
  'price-asc': [{ price: 'asc' }, { id: 'desc' }],
  'price-desc': [{ price: 'desc' }, { id: 'desc' }],
  'name-asc': [{ name: 'asc' }, { id: 'desc' }],
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll(query: ProductQuery) {
    const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 12, maxLimit: 50 });

    const where: Prisma.ProductWhereInput = {};

    const search = query.search?.trim();
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const price: Prisma.DecimalFilter<'Product'> = {};
    const minPrice = Number(query.minPrice);
    if (query.minPrice && Number.isFinite(minPrice) && minPrice >= 0) {
      price.gte = minPrice;
    }
    const maxPrice = Number(query.maxPrice);
    if (query.maxPrice && Number.isFinite(maxPrice) && maxPrice >= 0) {
      price.lte = maxPrice;
    }
    if (Object.keys(price).length > 0) {
      where.price = price;
    }

    if (query.inStock === 'true' || query.inStock === '1') {
      where.stock = { gt: 0 };
    }

    const orderBy = SORT_OPTIONS[query.sort ?? 'newest'] ?? SORT_OPTIONS.newest;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, orderBy, skip, take }),
      this.prisma.product.count({ where }),
    ]);

    return { items, meta: buildMeta(page, limit, total) };
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
