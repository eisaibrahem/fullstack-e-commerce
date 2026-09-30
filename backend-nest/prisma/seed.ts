import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const userPassword = await bcrypt.hash('user12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      email: 'admin@shop.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@shop.com' },
    update: {},
    create: {
      email: 'user@shop.com',
      password: userPassword,
      role: 'USER',
    },
  });

  const products = [
    { name: 'Wireless Headphones', price: 79.99, stock: 50, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { name: 'Smart Watch', price: 199.99, stock: 30, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    { name: 'Laptop Stand', price: 49.99, stock: 100, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
    { name: 'Mechanical Keyboard', price: 129.99, stock: 25, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { name: 'USB-C Hub', price: 39.99, stock: 75, image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=400' },
    { name: 'Webcam HD', price: 89.99, stock: 40, image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400' },
    { name: 'Desk Lamp LED', price: 34.99, stock: 60, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
    { name: 'Mouse Pad XL', price: 19.99, stock: 200, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
    { name: 'Bluetooth Speaker', price: 59.99, stock: 45, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
    { name: 'Phone Charger', price: 24.99, stock: 150, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400' },
    { name: 'Monitor Light Bar', price: 44.99, stock: 35, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
    { name: 'Cable Management Kit', price: 14.99, stock: 300, image: null },
    { name: 'Ergonomic Mouse', price: 69.99, stock: 55, image: null },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }

  console.log('Seed data created successfully');
  console.log('Admin: admin@shop.com / admin12345');
  console.log('User: user@shop.com / user12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
