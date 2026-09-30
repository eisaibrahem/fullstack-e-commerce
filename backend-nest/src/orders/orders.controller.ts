import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
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
  findAll(@Req() req: RequestWithUser) {
    return this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.findOne(req.user.sub, +id);
  }
}
