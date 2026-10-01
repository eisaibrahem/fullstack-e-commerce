import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

interface RequestWithUser extends Request {
  user: { sub: number; email: string; role: string };
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: RequestWithUser) {
    return this.ordersService.create(req.user.sub);
  }

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10, max 50)' })
  findAll(@Req() req: RequestWithUser, @Query() query: { page?: string; limit?: string }) {
    return this.ordersService.findAll(req.user.sub, query);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.sub, +id);
  }
}
