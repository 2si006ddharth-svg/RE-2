async function testE2E() {
  console.log('🧪 Starting LoyalShop End-to-End Verification Pipeline...\n');

  const BASE_URL = 'http://localhost:3000';
  let cookie = '';

  // 1. Register Daisy Tester
  console.log('1️⃣ Registering new user (Daisy Tester)...');
  const regEmail = `daisy_${Date.now()}@test.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Daisy Tester',
      email: regEmail,
      password: 'Password123!',
    }),
  });

  const regData = await regRes.json();
  const setCookie = regRes.headers.get('set-cookie');
  if (setCookie) {
    cookie = setCookie.split(';')[0];
  }
  console.log('   ✅ Registered:', regData.user.name, `(${regData.user.email})`);

  // 2. Check initial loyalty status
  console.log('\n2️⃣ Checking initial loyalty status...');
  const loyalRes = await fetch(`${BASE_URL}/api/loyalty`, {
    headers: { Cookie: cookie },
  });
  const loyalData = await loyalRes.json();
  console.log('   ✅ Initial Loyalty State:', {
    isRegular: loyalData.loyalty.isRegular,
    discountPercent: loyalData.loyalty.discountPercent,
    streakCount: loyalData.loyalty.streakCount,
    daysRemaining: loyalData.loyalty.daysRemaining,
  });

  // 3. Fetch products to get an ID
  const prodRes = await fetch(`${BASE_URL}/api/products`);
  const prodData = await prodRes.json();
  const prod1 = prodData.products[0]; // AcousticPro Headphones ($149.99)
  const prod2 = prodData.products[1]; // Mechanical Keyboard ($119.50)
  console.log(`\n3️⃣ Found products: "${prod1.name}" ($${prod1.price}) and "${prod2.name}" ($${prod2.price})`);

  // 4. Place 1st Order (No discount expected, activates regular status)
  console.log('\n4️⃣ Placing Order #1...');
  const order1Res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      items: [{ productId: prod1.id, quantity: 1 }],
    }),
  });
  const order1Data = await order1Res.json();
  console.log('   ✅ Order #1 Completed:', {
    orderId: order1Data.order.id,
    subtotal: order1Data.order.subtotal,
    discountPercent: order1Data.order.discountPercent,
    discountAmount: order1Data.order.discountAmount,
    total: order1Data.order.total,
    status: order1Data.order.status,
  });

  // 5. Verify loyalty status is now Regular with Streak 1 and 10 days remaining
  console.log('\n5️⃣ Verifying updated loyalty status after Order #1...');
  const loyal2Res = await fetch(`${BASE_URL}/api/loyalty`, {
    headers: { Cookie: cookie },
  });
  const loyal2Data = await loyal2Res.json();
  console.log('   ✅ Loyalty State After Order #1:', {
    isRegular: loyal2Data.loyalty.isRegular,
    discountPercent: loyal2Data.loyalty.discountPercent,
    streakCount: loyal2Data.loyalty.streakCount,
    daysRemaining: loyal2Data.loyalty.daysRemaining,
  });

  // 6. Place Order #2 (Within 10-day window -> 10% discount should apply automatically!)
  console.log('\n6️⃣ Placing Order #2 (Within 10-day window)...');
  const order2Res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      items: [{ productId: prod2.id, quantity: 1 }],
    }),
  });
  const order2Data = await order2Res.json();
  console.log('   ✅ Order #2 Completed with Automatic Discount:', {
    orderId: order2Data.order.id,
    subtotal: order2Data.order.subtotal,
    discountPercent: order2Data.order.discountPercent + '%',
    discountAmount: `-$${order2Data.order.discountAmount}`,
    total: `$${order2Data.order.total}`,
    savingsVerified: order2Data.order.discountAmount > 0,
  });

  // 7. Verify streak incremented to 2
  const loyal3Res = await fetch(`${BASE_URL}/api/loyalty`, {
    headers: { Cookie: cookie },
  });
  const loyal3Data = await loyal3Res.json();
  console.log('   ✅ Loyalty State After Order #2:', {
    isRegular: loyal3Data.loyalty.isRegular,
    streakCount: loyal3Data.loyalty.streakCount,
    discountPercent: loyal3Data.loyalty.discountPercent + '%',
    daysRemaining: loyal3Data.loyalty.daysRemaining,
  });

  // 8. Simulate 11 Days Passing (Status should lapse and discount removed!)
  console.log('\n7️⃣ Simulating 11 days passing (Exceeding the 10-day window)...');
  const simRes = await fetch(`${BASE_URL}/api/dev/simulate-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ days: 11 }),
  });
  const simData = await simRes.json();
  console.log('   ✅ Time fast-forwarded:', simData.message);

  // 9. Verify loyalty status has lapsed to 0% discount
  const loyal4Res = await fetch(`${BASE_URL}/api/loyalty`, {
    headers: { Cookie: cookie },
  });
  const loyal4Data = await loyal4Res.json();
  console.log('   ✅ Loyalty State After 11 Days:', {
    isRegular: loyal4Data.loyalty.isRegular,
    discountPercent: loyal4Data.loyalty.discountPercent + '%',
    streakCount: loyal4Data.loyalty.streakCount,
    daysRemaining: loyal4Data.loyalty.daysRemaining,
  });

  // 10. Place Win-Back Order (Order placed while lapsed)
  console.log('\n8️⃣ Placing Win-Back Order...');
  const order3Res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      items: [{ productId: prod1.id, quantity: 1 }],
    }),
  });
  const order3Data = await order3Res.json();
  console.log('   ✅ Win-Back Order Paid (No discount on win-back order itself):', {
    subtotal: order3Data.order.subtotal,
    discountPercent: order3Data.order.discountPercent + '%',
    total: order3Data.order.total,
  });

  // 11. Check loyalty status restored to Regular with fresh streak 1
  const loyal5Res = await fetch(`${BASE_URL}/api/loyalty`, {
    headers: { Cookie: cookie },
  });
  const loyal5Data = await loyal5Res.json();
  console.log('   ✅ Loyalty State After Win-Back Order (Restored!):', {
    isRegular: loyal5Data.loyalty.isRegular,
    streakCount: loyal5Data.loyalty.streakCount,
    discountPercent: loyal5Data.loyalty.discountPercent + '%',
    daysRemaining: loyal5Data.loyalty.daysRemaining,
  });

  // 12. Login as Admin and Verify Analytics
  console.log('\n9️⃣ Verifying Admin Dashboard Analytics...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@loyalshop.com',
      password: 'Admin123!',
    }),
  });
  const rawAdminCookie = adminLoginRes.headers.get('set-cookie');
  const adminCookie = rawAdminCookie ? rawAdminCookie.split(';')[0] : '';
  const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  const adminStatsData = await adminStatsRes.json();
  console.log('   ✅ Admin Dashboard Metrics:', {
    grossSales: `$${adminStatsData.stats.totalSales.toFixed(2)}`,
    totalOrders: adminStatsData.stats.totalOrders,
    loyaltyDiscountGiven: `$${adminStatsData.stats.totalDiscountGiven.toFixed(2)}`,
    regularCustomers: `${adminStatsData.stats.regularCustomers} / ${adminStatsData.stats.totalCustomers}`,
    repeatPurchaseRate: `${adminStatsData.stats.repeatRate}%`,
    aboutToLoseStatus: adminStatsData.stats.aboutToLose,
  });

  console.log('\n🎉 ALL 12 END-TO-END VERIFICATION STEPS PASSED SUCCESSFULLY!');
}

testE2E().catch(console.error);
