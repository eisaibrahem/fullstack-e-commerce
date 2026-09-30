import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { sub: number; email: string; role: string };
}

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: RequestWithUser) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  addItem(@Req() req: RequestWithUser, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(req.user.sub, addToCartDto);
  }

  @Patch('items/:productId')
  updateItem(
    @Req() req: RequestWithUser,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.sub, +productId, updateCartItemDto);
  }

  @Delete('items/:productId')
  removeItem(@Req() req: RequestWithUser, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.sub, +productId);
  }

  @Delete()
  clearCart(@Req() req: RequestWithUser) {
    return this.cartService.clearCart(req.user.sub);
  }
}
