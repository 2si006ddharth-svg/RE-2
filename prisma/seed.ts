import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.loyaltyStatus.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.setting.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Store Admin',
      email: 'admin@loyalshop.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  const now = new Date();

  // 2. Five Customers in distinct loyalty states
  // Customer 1: Active Regular (bought 2 days ago, streak 2 -> 10% discount)
  const custActive = await prisma.user.create({
    data: {
      name: 'Alex Active',
      email: 'alex@example.com',
      passwordHash,
      role: 'customer',
      loyalty: {
        create: {
          isRegular: true,
          streakCount: 2,
          currentDiscountPercent: 10,
          lastPurchaseAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  // Customer 2: Expiring Soon (bought 9 days ago -> 1 day left to keep 10% discount)
  const custExpiring = await prisma.user.create({
    data: {
      name: 'Emma Expiring',
      email: 'emma@example.com',
      passwordHash,
      role: 'customer',
      loyalty: {
        create: {
          isRegular: true,
          streakCount: 1,
          currentDiscountPercent: 10,
          lastPurchaseAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        },
      },
      notifications: {
        create: [
          {
            type: 'reminder',
            message:
              '⏳ Reminder: Only 1 day left to keep your 10% Regular Customer discount! Place an order soon.',
          },
        ],
      },
    },
  });

  // Customer 3: Expired / Lapsed (bought 15 days ago -> 0% discount, win-back banner)
  const custExpired = await prisma.user.create({
    data: {
      name: 'Liam Lapsed',
      email: 'liam@example.com',
      passwordHash,
      role: 'customer',
      loyalty: {
        create: {
          isRegular: false,
          streakCount: 0,
          currentDiscountPercent: 0,
          lastPurchaseAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
      },
      notifications: {
        create: [
          {
            type: 'status_change',
            message:
              '⚠️ Your Regular Customer discount has expired! Make any purchase to win back your 10% discount and restart your streak.',
          },
        ],
      },
    },
  });

  // Customer 4: Brand New Customer (0 orders, no loyalty record yet)
  const custNew = await prisma.user.create({
    data: {
      name: 'Noah New',
      email: 'noah@example.com',
      passwordHash,
      role: 'customer',
      loyalty: {
        create: {
          isRegular: false,
          streakCount: 0,
          currentDiscountPercent: 0,
          lastPurchaseAt: null,
          expiresAt: null,
        },
      },
      notifications: {
        create: [
          {
            type: 'welcome',
            message:
              'Welcome to LoyalShop, Noah! Make your first purchase to unlock your 10-day Regular Customer discount.',
          },
        ],
      },
    },
  });

  // Customer 5: High Streak Regular (streak 6 -> 20% discount, bought yesterday)
  const custStreak = await prisma.user.create({
    data: {
      name: 'Sophia Streak',
      email: 'sophia@example.com',
      passwordHash,
      role: 'customer',
      loyalty: {
        create: {
          isRegular: true,
          streakCount: 6,
          currentDiscountPercent: 20,
          lastPurchaseAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        },
      },
      notifications: {
        create: [
          {
            type: 'streak',
            message:
              '🔥 Phenomenal! You have reached a 6-order streak and earned a 20% Regular Customer discount!',
          },
        ],
      },
    },
  });

  // 3. Seed 12 High-Quality Products
  const products = [
    {
      name: 'AcousticPro Wireless ANC Headphones',
      description:
        'Studio-grade sound, active noise cancellation, and ultra-plush memory foam earcups with 40-hour battery life.',
      price: 149.99,
      category: 'Audio',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    },
    {
      name: 'Mechanical Tactile Keyboard RGB',
      description:
        'Hot-swappable mechanical switches, aircraft-grade aluminum frame, and customizable per-key backlighting.',
      price: 119.5,
      category: 'Accessories',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    },
    {
      name: 'Artisan Precision Pour-Over Kettle',
      description:
        'Gooseneck stainless steel kettle with digital temperature gauge and ergonomic counterbalance handle.',
      price: 68.0,
      category: 'Coffee & Kitchen',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80',
    },
    {
      name: 'Minimalist Ceramic Desk Lamp',
      description:
        'Warm ambient lighting with seamless touch dimming and matte stone finish ceramic base.',
      price: 54.9,
      category: 'Home & Office',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    },
    {
      name: 'Everyday Commuter Leather Backpack',
      description:
        'Water-resistant full-grain leather with dedicated padded 16-inch laptop compartment and luggage pass-through.',
      price: 185.0,
      category: 'Lifestyle',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    },
    {
      name: 'Studio Monitor Bookshelf Speakers',
      description:
        'High-fidelity bi-amplified desktop audio monitors with Bluetooth 5.2 and optical inputs.',
      price: 219.0,
      category: 'Audio',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    },
    {
      name: 'Single Origin Ethiopian Coffee Beans (1kg)',
      description:
        'Freshly roasted specialty whole bean coffee with delicate notes of jasmine, bergamot, and candied lemon.',
      price: 32.5,
      category: 'Coffee & Kitchen',
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    },
    {
      name: 'Aerospace Aluminum Laptop Stand',
      description:
        'Ergonomic elevated stand promoting airflow and posture, precision carved from solid aluminum block.',
      price: 45.0,
      category: 'Accessories',
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    },
    {
      name: 'Smart Hybrid Fitness Smartwatch',
      description:
        'Classic analog hands over a stealth OLED health display with heart rate, SpO2, and 14-day battery.',
      price: 159.0,
      category: 'Lifestyle',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    },
    {
      name: 'Double-Walled Insulated Travel Tumbler',
      description:
        'Vacuum insulated 500ml travel bottle maintaining icy drinks for 24h and hot coffee for 12h.',
      price: 28.0,
      category: 'Coffee & Kitchen',
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    },
    {
      name: 'Wireless Fast Charging Desk Pad',
      description:
        'Premium vegan leather oversized mouse mat featuring an integrated 15W Qi wireless charger.',
      price: 49.9,
      category: 'Home & Office',
      stock: 75,
      imageUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?w=800&q=80',
    },
    {
      name: 'Hi-Fi True Wireless Noise Cancelling Earbuds',
      description:
        'Beryllium dynamic drivers, IPX7 water resistance, wireless charging case, and crystal-clear call quality.',
      price: 99.0,
      category: 'Audio',
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    },
    // Fruits
    {
      name: 'Fresh Alphonso Mangoes (Box of 6)',
      description:
        'Sweet, fragrant, and handpicked premium Alphonso mangoes, sun-ripened to golden perfection.',
      price: 12.99,
      category: 'Fruits',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
    },
    {
      name: 'Crisp Honeycrisp Apples (1kg)',
      description:
        'Orchard-fresh juicy Honeycrisp apples with explosive sweetness and signature crunchy bite.',
      price: 4.99,
      category: 'Fruits',
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80',
    },
    {
      name: 'Organic Hass Avocados (Pack of 4)',
      description:
        'Creamy, nutrient-rich ready-to-eat Hass avocados, ideal for guacamole, salads, and morning toast.',
      price: 5.99,
      category: 'Fruits',
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
    },
    {
      name: 'Organic Wild Blueberries (250g)',
      description:
        'Plump, antioxidant-loaded wild blueberries picked fresh for smoothies, yogurts, and healthy snacking.',
      price: 4.49,
      category: 'Fruits',
      stock: 75,
      imageUrl: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&q=80',
    },
    {
      name: 'Sweet Cavendish Bananas (Bunch of 6)',
      description:
        'Naturally sweet and potassium-rich ripe Cavendish bananas, the ultimate pre-workout fuel.',
      price: 2.49,
      category: 'Fruits',
      stock: 150,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
    },
    {
      name: 'Ruby Red Strawberries (400g Clamshell)',
      description:
        'Sweet, juicy California strawberries with rich crimson color and natural garden-fresh fragrance.',
      price: 4.99,
      category: 'Fruits',
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
    },
    // Vegetables
    {
      name: 'Baby Spinach & Wild Arugula Mix (300g)',
      description:
        'Tender, washed organic greens packed with iron and vitamins. Ready to toss into crisp fresh salads.',
      price: 3.99,
      category: 'Vegetables',
      stock: 85,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
    },
    {
      name: 'Sweet Cherry Vine Tomatoes (500g)',
      description:
        'Sun-ripened burst-in-your-mouth cherry tomatoes picked on the vine for deep, concentrated flavor.',
      price: 3.79,
      category: 'Vegetables',
      stock: 110,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    },
    {
      name: 'Farm Fresh Broccoli Crowns (500g)',
      description:
        'Vibrant green, crisp broccoli florets high in fiber and vitamin C. Ideal for steaming or roasting.',
      price: 2.99,
      category: 'Vegetables',
      stock: 95,
      imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=800&q=80',
    },
    {
      name: 'Rainbow Bell Peppers (Pack of 3)',
      description:
        'A colorful medley of sweet red, yellow, and orange bell peppers rich in vitamins A and C.',
      price: 4.49,
      category: 'Vegetables',
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80',
    },
    {
      name: 'Organic Crunchy Baby Carrots (450g)',
      description:
        'Sweet, bite-sized washed carrots, perfect for dipping in hummus or snacking on the go.',
      price: 2.49,
      category: 'Vegetables',
      stock: 130,
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=800&q=80',
    },
    // Fresh Juices & Beverages
    {
      name: 'Cold-Pressed Green Glow Detox Juice (500ml)',
      description:
        'Raw, unpasteurized blend of kale, crisp cucumber, green apple, celery, ginger, and Meyer lemon.',
      price: 5.99,
      category: 'Fresh Juices',
      stock: 65,
      imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&q=80',
    },
    {
      name: 'Valencia Squeezed Orange Juice (1L)',
      description:
        '100% pure squeezed Valencia oranges with smooth pulp and no added sugars or preservatives.',
      price: 6.49,
      category: 'Fresh Juices',
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
    },
    {
      name: 'Wild Berry & Pomegranate Elixir (500ml)',
      description:
        'Potent antioxidant cold-pressed blend of pomegranate, blueberries, blackberries, and a splash of lime.',
      price: 5.49,
      category: 'Fresh Juices',
      stock: 70,
      imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80',
    },
    {
      name: 'Artisan Sparkling Lemonade & Ginger (4-Pack)',
      description:
        'Refreshing fizzy lemonade infused with crushed cold-pressed Peruvian ginger and pure cane sugar.',
      price: 7.99,
      category: 'Fresh Juices',
      stock: 55,
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
    },
    // Healthy Snacks
    {
      name: 'Roasted Sea Salt & Cracked Pepper Cashews (200g)',
      description:
        'Slow-roasted jumbo cashews tossed in mineral sea salt and fragrant black tellicherry pepper.',
      price: 6.99,
      category: 'Healthy Snacks',
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1536591375315-1b838429b31d?w=800&q=80',
    },
    {
      name: 'Black Truffle & Sea Salt Kettle Chips (150g)',
      description:
        'Hand-cooked golden potato crisps seasoned with aromatic Italian black truffles and sea salt.',
      price: 4.29,
      category: 'Healthy Snacks',
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80',
    },
    {
      name: '70% Dark Chocolate Almond Bark (180g)',
      description:
        'Fair-trade Belgian dark chocolate with roasted California almonds and a hint of Fleur de Sel.',
      price: 5.99,
      category: 'Healthy Snacks',
      stock: 90,
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800&q=80',
    },
    {
      name: 'Ancient Grain Sea Salt Pita Chips (250g)',
      description:
        'Oven-baked whole wheat and quinoa pita chips with extra virgin olive oil and Greek oregano.',
      price: 3.99,
      category: 'Healthy Snacks',
      stock: 110,
      imageUrl: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
    },
  ];

  const createdProducts = [];
  for (const prod of products) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);
  }

  // 4. Seed initial orders for customers to populate stats
  // Alex Active: 2 past orders
  await prisma.order.create({
    data: {
      userId: custActive.id,
      subtotal: 149.99,
      discountPercent: 0,
      discountAmount: 0,
      total: 149.99,
      status: 'paid',
      paidAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: createdProducts[0].id, quantity: 1, unitPrice: 149.99 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: custActive.id,
      subtotal: 119.5,
      discountPercent: 10,
      discountAmount: 11.95,
      total: 107.55,
      status: 'paid',
      paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          { productId: createdProducts[1].id, quantity: 1, unitPrice: 119.5 },
        ],
      },
    },
  });

  // Sophia Streak: 6 past orders!
  for (let i = 6; i >= 1; i--) {
    const daysAgo = i * 4;
    await prisma.order.create({
      data: {
        userId: custStreak.id,
        subtotal: 80.0,
        discountPercent: i > 1 ? 15 : 0,
        discountAmount: i > 1 ? 12.0 : 0,
        total: i > 1 ? 68.0 : 80.0,
        status: 'paid',
        paidAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        items: {
          create: [
            { productId: createdProducts[2].id, quantity: 1, unitPrice: 68.0 },
          ],
        },
      },
    });
  }

  // 5. Default Settings
  const defaultSettings = [
    { key: 'REGULAR_WINDOW_DAYS', value: '10' },
    { key: 'BASE_DISCOUNT', value: '10' },
    { key: 'MAX_DISCOUNT_CAP', value: '25' },
    {
      key: 'STREAK_TIERS',
      value: JSON.stringify([
        { min: 1, max: 2, discount: 10 },
        { min: 3, max: 5, discount: 15 },
        { min: 6, max: 9999, discount: 20 },
      ]),
    },
    { key: 'REMINDER_DAYS', value: JSON.stringify([7, 9]) },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.create({ data: s });
  }

  console.log('✅ Seeding completed successfully!');
  console.log('👤 Admin: admin@loyalshop.com (Admin123!)');
  console.log('👤 Customers (Password: Password123!):');
  console.log('   - alex@example.com (Active Regular, streak 2, 10% off)');
  console.log('   - emma@example.com (Expiring in 1 day, 10% off)');
  console.log('   - liam@example.com (Lapsed 15 days ago, 0% off)');
  console.log('   - noah@example.com (Brand new, 0 orders)');
  console.log('   - sophia@example.com (High streak 6, 20% off)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
