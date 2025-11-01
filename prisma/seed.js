const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Test User',
      password: 'hashed-password-123', // In real app, this would be properly hashed
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: 'hashed-password-456',
      role: 'ADMIN',
    },
  });

  console.log('Created users:', [user1, user2]);

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro 256GB',
      description: 'Apple A17 Pro chip, 6.1-inch OLED display, titanium design',
      category: 'Smartphones',
      brand: 'Apple',
      image: '/placeholder.svg?height=300&width=300&text=iPhone+15+Pro',
      prices: {
        create: [
          {
            price: 1199,
            currency: 'USD',
            platform: 'Amazon',
            url: 'https://amazon.com/iphone15pro',
            inStock: true,
          },
          {
            price: 1189,
            currency: 'USD',
            platform: 'BestBuy',
            url: 'https://bestbuy.com/iphone15pro',
            inStock: true,
          },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'MacBook Air 15-inch M2',
      description: '15.3-inch Liquid Retina display, M2 chip, up to 18 hours battery life',
      category: 'Laptops',
      brand: 'Apple',
      image: '/placeholder.svg?height=300&width=300&text=MacBook+Air',
      prices: {
        create: [
          {
            price: 1299,
            currency: 'USD',
            platform: 'Apple Store',
            url: 'https://apple.com/macbook-air',
            inStock: true,
          },
        ],
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S24',
      description: 'Latest Samsung flagship with advanced camera system',
      category: 'Smartphones',
      brand: 'Samsung',
      image: '/placeholder.svg?height=300&width=300&text=Galaxy+S24',
      prices: {
        create: [
          {
            price: 999,
            currency: 'USD',
            platform: 'Samsung Store',
            url: 'https://samsung.com/galaxys24',
            inStock: true,
          },
        ],
      },
    },
  });

  console.log('Created products:', [product1, product2, product3]);

  // Create sample searches
  await prisma.search.createMany({
    data: [
      { query: 'iPhone 15', userId: user1.id },
      { query: 'MacBook Pro', userId: user1.id },
      { query: 'Samsung Galaxy', userId: user1.id },
      { query: 'Gaming Laptop', userId: user2.id },
      { query: 'Wireless Headphones', userId: user2.id },
    ],
  });

  console.log('Created sample searches');

  // Create sample favorites
  await prisma.user.update({
    where: { id: user1.id },
    data: {
      favorites: {
        connect: [{ id: product1.id }, { id: product3.id }],
      },
    },
  });

  console.log('Created sample favorites');

  // Create sample price alerts
  await prisma.priceAlert.create({
    data: {
      userId: user1.id,
      productId: product1.id,
      targetPrice: 1100,
      currency: 'USD',
      status: 'ACTIVE',
    },
  });

  console.log('Created sample price alerts');

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });