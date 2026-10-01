import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { parsePagination, buildMeta } from '../common/pagination.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  async findAll(query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = parsePagination(query, { defaultLimit: 10, maxLimit: 50 });

    const select = {
      id: true,
      email: true,
      role: true,
      name: true,
      phone: true,
      image: true,
      imagePublicId: true,
      address: true,
    } satisfies Prisma.UserSelect;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ select, skip, take, orderBy: { id: 'desc' } }),
      this.prisma.user.count(),
    ]);

    return { items, meta: buildMeta(page, limit, total) };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return this.prisma.user.update({ where: { id }, data: updateUserDto });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        address: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        address: updateUserDto.address,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        address: true,
        role: true,
      },
    });

    return user;
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async uploadProfileImage(userId: number, file: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { url, publicId } = await this.cloudinary.uploadImage(file, 'users');

    if (user.imagePublicId) {
      await this.cloudinary.deleteImage(user.imagePublicId).catch(() => { });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { image: url, imagePublicId: publicId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        address: true,
        role: true,
      },
    });
  }

  async deleteProfileImage(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.imagePublicId) {
      await this.cloudinary.deleteImage(user.imagePublicId).catch(() => { });
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { image: null, imagePublicId: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        address: true,
        role: true,
      },
    });
  }
}
