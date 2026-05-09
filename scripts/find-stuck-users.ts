import { getPayload } from 'payload';
import config from '../src/payload.config.js';

async function run() {
  const payload = await getPayload({ config });

  // Get date for 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  console.log(`\n🔍 Searching for users who had booking issues since ${sevenDaysAgo.toLocaleDateString('ar-EG')}...\n`);

  const stuckBookings = await payload.find({
    collection: 'bookings',
    where: {
      status: {
        in: ['payment_failed', 'cancelled_overdue', 'pending'],
      },
      updatedAt: {
        greater_than_equal: sevenDaysAgo.toISOString(),
      },
    },
    limit: 1000,
    depth: 2, // Fetch User and Round/Event details
  });

  const usersMap = new Map();

  for (const booking of stuckBookings.docs) {
    const user = booking.user;
    if (!user || typeof user !== 'object') continue;

    const round = booking.round && typeof booking.round === 'object' ? booking.round : null;
    const event = booking.event && typeof booking.event === 'object' ? booking.event : null;
    
    let targetName = 'Unknown Program';
    if (round && round.program && typeof round.program === 'object') {
        targetName = round.program.titleAr || round.program.titleEn || 'Unknown Program';
    } else if (event) {
        targetName = event.titleAr || event.titleEn || 'Unknown Event';
    }

    const key = `${user.email}-${targetName}`;
    
    if (!usersMap.has(key)) {
      usersMap.set(key, {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        phone: user.phone || 'N/A',
        target: targetName,
        status: booking.status,
        date: new Date(booking.updatedAt).toLocaleDateString('ar-EG')
      });
    }
  }

  const results = Array.from(usersMap.values());
  
  if (results.length === 0) {
    console.log('✅ No stuck users found in the last 7 days.');
    process.exit(0);
  }

  console.log(`⚠️ Found ${results.length} unique users who might have faced issues:\n`);
  
  results.forEach((u, index) => {
    console.log(`${index + 1}. Name: ${u.name}`);
    console.log(`   Email: ${u.email}`);
    console.log(`   Phone: ${u.phone}`);
    console.log(`   Target: ${u.target}`);
    console.log(`   Last Status: ${u.status}`);
    console.log(`   Date: ${u.date}`);
    console.log('-----------------------------------');
  });

  console.log(`\nTotal users affected: ${results.length}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
