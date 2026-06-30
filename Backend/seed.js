// Backend/seed.js
// ─────────────────────────────────────────────────────────────────────────────
// Run ONCE to seed realistic fake issues into MongoDB.
// Usage: node seed.js
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config();
const mongoose = require('mongoose');
const Issue    = require('./models/Issue');

// 20 realistic Indian city issues spread across all categories and severities
const SEED_ISSUES = [
    {
        title: 'Large pothole on MG Road causing accidents',
        description: 'A massive pothole near the bus stop on MG Road. Two bikes have skidded this week. Urgent repair needed before monsoon.',
        category: 'Roads & Potholes',
        severity: 'High',
        status: 'Verified',
        upvotes: 12,
        reportedBy: 'Siddharth Nair',
        location: { latitude: 12.9716, longitude: 77.5946, address: 'MG Road, Bengaluru' },
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Street light out near Andheri station',
        description: 'Four consecutive street lights near Andheri East station exit are non-functional for 2 weeks. Very dark and unsafe at night.',
        category: 'Electrical & Streetlights',
        severity: 'High',
        status: 'In Progress',
        upvotes: 8,
        reportedBy: 'Ananya Sharma',
        location: { latitude: 19.1197, longitude: 72.8469, address: 'Andheri East, Mumbai' },
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Overflowing drain near Sarojini Nagar market',
        description: 'Drain near the vegetable market is overflowing and mixing with drinking water supply. Foul smell and mosquito breeding.',
        category: 'Water & Sanitation',
        severity: 'High',
        status: 'Pending',
        upvotes: 6,
        reportedBy: 'Rohit Verma',
        location: { latitude: 28.5745, longitude: 77.1994, address: 'Sarojini Nagar, New Delhi' },
        imageUrl: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Garbage dumped on footpath for 5 days',
        description: 'Municipal garbage truck has not visited our street for 5 days. Residents are dumping trash on footpath. Health hazard.',
        category: 'Waste Management',
        severity: 'Medium',
        status: 'Verified',
        upvotes: 7,
        reportedBy: 'Priya Patel',
        location: { latitude: 23.0225, longitude: 72.5714, address: 'Satellite Area, Ahmedabad' },
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Children\'s park swings broken and rusted',
        description: 'The swings and see-saw in Sector 18 park are broken. Children got injured last week. Needs immediate replacement.',
        category: 'Public Facilities & Parks',
        severity: 'Medium',
        status: 'Pending',
        upvotes: 3,
        reportedBy: 'Siddharth Nair',
        location: { latitude: 28.6471, longitude: 77.0601, address: 'Sector 18, Noida' },
        imageUrl: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Water supply pipe leaking at main junction',
        description: 'A major water supply pipe has been leaking at the T-junction near Koramangala water tank. 30% water pressure loss noticed.',
        category: 'Water & Sanitation',
        severity: 'High',
        status: 'In Progress',
        upvotes: 10,
        reportedBy: 'Ananya Sharma',
        location: { latitude: 12.9352, longitude: 77.6245, address: 'Koramangala, Bengaluru' },
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Illegal dumping near Powai lake',
        description: 'Construction debris and household waste dumped illegally near the lake shore. Environmental damage and blockage of walking trail.',
        category: 'Waste Management',
        severity: 'Medium',
        status: 'Pending',
        upvotes: 4,
        reportedBy: 'Rohit Verma',
        location: { latitude: 19.1269, longitude: 72.9062, address: 'Powai Lake, Mumbai' },
        imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Road cave-in near Juhu circle',
        description: 'A portion of the road near Juhu circle has caved in, likely due to a broken underground water main. Vehicles diverting.',
        category: 'Roads & Potholes',
        severity: 'High',
        status: 'Verified',
        upvotes: 9,
        reportedBy: 'Priya Patel',
        location: { latitude: 19.0990, longitude: 72.8259, address: 'Juhu Circle, Mumbai' },
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Transformer buzzing loudly near residential block',
        description: 'Transformer near Block C has been making loud buzzing sounds with flickering lights for 3 days. Risk of electric fire.',
        category: 'Electrical & Streetlights',
        severity: 'High',
        status: 'Pending',
        upvotes: 5,
        reportedBy: 'Siddharth Nair',
        location: { latitude: 17.3850, longitude: 78.4867, address: 'Hitech City, Hyderabad' },
        imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Public toilet facility locked and unusable',
        description: 'The Sulabh Sauchalaya near the bus stand has been locked for 2 weeks. Hundreds of commuters affected daily.',
        category: 'Public Facilities & Parks',
        severity: 'Medium',
        status: 'Pending',
        upvotes: 2,
        reportedBy: 'Ananya Sharma',
        location: { latitude: 22.5726, longitude: 88.3639, address: 'Howrah Bus Stand, Kolkata' },
        imageUrl: 'https://images.unsplash.com/photo-1600267204091-5c1ab8b10c02?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Footpath encroached by vendors near market',
        description: 'Footpath completely blocked by unauthorised vendors near Crawford market. Pedestrians forced to walk on road.',
        category: 'Others',
        severity: 'Low',
        status: 'Pending',
        upvotes: 1,
        reportedBy: 'Rohit Verma',
        location: { latitude: 18.9388, longitude: 72.8359, address: 'Crawford Market, Mumbai' },
        imageUrl: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Speed breaker damaged causing vehicle damage',
        description: 'Speed breaker on Outer Ring Road broken in the centre. Metal rods sticking out. Two cars already got flat tyres.',
        category: 'Roads & Potholes',
        severity: 'Medium',
        status: 'Pending',
        upvotes: 3,
        reportedBy: 'Priya Patel',
        location: { latitude: 12.9699, longitude: 77.7499, address: 'Outer Ring Road, Bengaluru' },
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Broken water tanker hydrant wasting water',
        description: 'The municipal hydrant at Linking Road has been gushing water for 3 days. Hundreds of litres wasted. Road also waterlogged.',
        category: 'Water & Sanitation',
        severity: 'Medium',
        status: 'Verified',
        upvotes: 6,
        reportedBy: 'Siddharth Nair',
        location: { latitude: 19.0607, longitude: 72.8362, address: 'Linking Road, Bandra, Mumbai' },
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Uncollected E-waste dumped near school',
        description: 'Old computers and electronic parts dumped outside a school gate. Children handling items. Toxic hazard.',
        category: 'Waste Management',
        severity: 'High',
        status: 'Pending',
        upvotes: 4,
        reportedBy: 'Ananya Sharma',
        location: { latitude: 13.0827, longitude: 80.2707, address: 'T Nagar, Chennai' },
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Footpath lights not working in residential colony',
        description: 'All 8 footpath solar lights in Green Park Colony are dead. Street completely dark post 8 PM. Senior residents afraid to walk.',
        category: 'Electrical & Streetlights',
        severity: 'Medium',
        status: 'Pending',
        upvotes: 2,
        reportedBy: 'Rohit Verma',
        location: { latitude: 28.5582, longitude: 77.2073, address: 'Green Park, New Delhi' },
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Tree fallen on road after storm',
        description: 'Large neem tree uprooted by last night\'s storm blocking half the road on Station Road. One lane closed. Slow traffic.',
        category: 'Others',
        severity: 'High',
        status: 'Resolved',
        upvotes: 11,
        reportedBy: 'Priya Patel',
        location: { latitude: 21.1702, longitude: 72.8311, address: 'Station Road, Surat' },
        imageUrl: 'https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Stray dog menace near primary school',
        description: 'A pack of 8–10 aggressive stray dogs near the primary school has bitten 2 children. Parents scared to send kids.',
        category: 'Others',
        severity: 'High',
        status: 'In Progress',
        upvotes: 14,
        reportedBy: 'Siddharth Nair',
        location: { latitude: 26.8467, longitude: 80.9462, address: 'Hazratganj, Lucknow' },
        imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Manhole open on busy street — fall hazard',
        description: 'Open manhole without cover on Brigade Road. Already one pedestrian fell last evening. Emergency cover required.',
        category: 'Roads & Potholes',
        severity: 'High',
        status: 'Verified',
        upvotes: 16,
        reportedBy: 'Ananya Sharma',
        location: { latitude: 12.9754, longitude: 77.6094, address: 'Brigade Road, Bengaluru' },
        imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Overflowing garbage bin near temple',
        description: 'Municipal bin outside Shirdi temple overflowing for 4 days. Waste spilling onto footpath. Devotees very upset.',
        category: 'Waste Management',
        severity: 'Low',
        status: 'Pending',
        upvotes: 1,
        reportedBy: 'Rohit Verma',
        location: { latitude: 19.7685, longitude: 74.4793, address: 'Shirdi, Ahmednagar' },
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=70',
    },
    {
        title: 'Broken bench and no drinking water in bus shelter',
        description: 'Bench broken and no functional water tap in the central bus shelter at Koregaon Park. Commuters standing in heat.',
        category: 'Public Facilities & Parks',
        severity: 'Low',
        status: 'Pending',
        upvotes: 1,
        reportedBy: 'Priya Patel',
        location: { latitude: 18.5362, longitude: 73.8937, address: 'Koregaon Park, Pune' },
        imageUrl: 'https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=600&auto=format&fit=crop&q=70',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Clear existing issues first to avoid duplicates on re-run
        await Issue.deleteMany({});
        console.log('🗑️  Cleared existing issues');

        // Insert seeded data
        const inserted = await Issue.insertMany(
        SEED_ISSUES.map(issue => ({
            title: issue.title,
            description: issue.description,
            imageUrl: issue.imageUrl,

            latitude: issue.location.latitude,
            longitude: issue.location.longitude,

            severity: issue.severity,
            category: issue.category,
            status: issue.status,
            upvotes: issue.upvotes,
            
            suggestedAction: "Awaiting inspection",

            createdAt: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            )
        }))
        );

        console.log(`🌱 Seeded ${inserted.length} issues successfully`);
        console.log('\nCategory breakdown:');
        const cats = inserted.reduce((a, i) => { a[i.category] = (a[i.category]||0)+1; return a; }, {});
        Object.entries(cats).forEach(([cat, n]) => console.log(`   ${cat}: ${n}`));

    } catch (err) {
        console.error('❌ Seed error:', err);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed. Seed complete!');
    }
}

seed();