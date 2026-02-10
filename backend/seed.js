/**
 * Seed Script - Creates dummy data for testing
 * Run: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Turf = require('./src/models/Turf');
const Booking = require('./src/models/Booking');
const Review = require('./src/models/Review');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Seed data
const seedData = async () => {
    try {
        console.log('\n🌱 Starting seed process...\n');

        // Clear existing data (except admin)
        await User.deleteMany({ role: { $ne: 'admin' } });
        await Turf.deleteMany({});
        await Booking.deleteMany({});
        await Review.deleteMany({});
        console.log('🗑️  Cleared existing data (except admin)');

        const hashedPassword = await hashPassword('password123');

        // =====================
        // CREATE OWNERS (6)
        // =====================
        const owners = await User.insertMany([
            { name: 'Raj Sports', email: 'owner1@test.com', password: hashedPassword, role: 'owner' },
            { name: 'Mumbai Turfs', email: 'owner2@test.com', password: hashedPassword, role: 'owner' },
            { name: 'Delhi Arena', email: 'owner3@test.com', password: hashedPassword, role: 'owner' },
            { name: 'Sports Hub', email: 'owner4@test.com', password: hashedPassword, role: 'owner' },
            { name: 'City Sports', email: 'owner5@test.com', password: hashedPassword, role: 'owner' },
            { name: 'Green Fields', email: 'owner6@test.com', password: hashedPassword, role: 'owner' },
        ]);
        console.log(`✅ Created ${owners.length} owners`);

        // =====================
        // CREATE USERS (8)
        // =====================
        const users = await User.insertMany([
            { name: 'Amit Kumar', email: 'user1@test.com', password: hashedPassword, role: 'user' },
            { name: 'Priya Sharma', email: 'user2@test.com', password: hashedPassword, role: 'user' },
            { name: 'Rahul Singh', email: 'user3@test.com', password: hashedPassword, role: 'user' },
            { name: 'Neha Patel', email: 'user4@test.com', password: hashedPassword, role: 'user' },
            { name: 'Vikram Reddy', email: 'user5@test.com', password: hashedPassword, role: 'user' },
            { name: 'Ananya Gupta', email: 'user6@test.com', password: hashedPassword, role: 'user' },
            { name: 'Arjun Mehta', email: 'user7@test.com', password: hashedPassword, role: 'user' },
            { name: 'Kavya Nair', email: 'user8@test.com', password: hashedPassword, role: 'user' },
        ]);
        console.log(`✅ Created ${users.length} users`);

        // =====================
        // CREATE TURFS (10)
        // =====================
        const turfs = await Turf.insertMany([
            {
                name: 'Green Field Arena',
                location: 'MG Road, Near City Mall',
                city: 'mumbai',
                pricePerHour: 1500,
                openingTime: '06:00',
                closingTime: '22:00',
                description: 'Premium football turf with international standard grass',
                amenities: ['parking', 'changing room', 'water', 'floodlights', 'first aid'],
                sportsTypes: ['football'],
                owner: owners[0]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Cricket Paradise',
                location: 'Andheri West, Sports Complex',
                city: 'mumbai',
                pricePerHour: 2000,
                openingTime: '05:00',
                closingTime: '23:00',
                description: 'Professional cricket pitch with bowling machines',
                amenities: ['parking', 'changing room', 'cafeteria', 'equipment rental'],
                sportsTypes: ['cricket'],
                owner: owners[0]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Multi Sport Hub',
                location: 'Koramangala, 5th Block',
                city: 'bangalore',
                pricePerHour: 1800,
                openingTime: '06:00',
                closingTime: '21:00',
                description: 'Multi-purpose turf for football, cricket and more',
                amenities: ['parking', 'changing room', 'water', 'wifi'],
                sportsTypes: ['football', 'cricket', 'hockey'],
                owner: owners[1]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Badminton Central',
                location: 'Indiranagar, 100ft Road',
                city: 'bangalore',
                pricePerHour: 800,
                openingTime: '06:00',
                closingTime: '22:00',
                description: '4 indoor badminton courts with wooden flooring',
                amenities: ['parking', 'changing room', 'air conditioning', 'equipment rental'],
                sportsTypes: ['badminton'],
                owner: owners[1]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Delhi Sports Arena',
                location: 'Dwarka Sector 21',
                city: 'delhi',
                pricePerHour: 1200,
                openingTime: '05:00',
                closingTime: '23:00',
                description: 'Large outdoor turf with professional lighting',
                amenities: ['parking', 'changing room', 'water', 'security'],
                sportsTypes: ['football', 'cricket'],
                owner: owners[2]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Tennis Court Pro',
                location: 'Vasant Kunj',
                city: 'delhi',
                pricePerHour: 1000,
                openingTime: '06:00',
                closingTime: '20:00',
                description: 'Clay and hard courts available',
                amenities: ['parking', 'changing room', 'coaching'],
                sportsTypes: ['tennis'],
                owner: owners[2]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Pune Sports Village',
                location: 'Hinjewadi Phase 1',
                city: 'pune',
                pricePerHour: 1400,
                openingTime: '06:00',
                closingTime: '22:00',
                description: 'Corporate-friendly turf with team facilities',
                amenities: ['parking', 'changing room', 'cafeteria', 'meeting room'],
                sportsTypes: ['football', 'cricket', 'volleyball'],
                owner: owners[3]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Basketball Court Elite',
                location: 'Marine Drive',
                city: 'mumbai',
                pricePerHour: 900,
                openingTime: '07:00',
                closingTime: '21:00',
                description: 'Professional basketball court with scoring system',
                amenities: ['changing room', 'water', 'scoreboard'],
                sportsTypes: ['basketball'],
                owner: owners[4]._id,
                status: 'approved',
                isActive: true,
            },
            {
                name: 'Pending Turf 1',
                location: 'New Area, Test Location',
                city: 'hyderabad',
                pricePerHour: 1100,
                openingTime: '06:00',
                closingTime: '22:00',
                description: 'New turf waiting for approval',
                amenities: ['parking', 'water'],
                sportsTypes: ['football'],
                owner: owners[5]._id,
                status: 'pending',
                isActive: true,
            },
            {
                name: 'Pending Turf 2',
                location: 'Tech Park Road',
                city: 'chennai',
                pricePerHour: 1300,
                openingTime: '06:00',
                closingTime: '21:00',
                description: 'Another pending turf for testing',
                amenities: ['parking', 'changing room'],
                sportsTypes: ['cricket', 'football'],
                owner: owners[5]._id,
                status: 'pending',
                isActive: true,
            },
        ]);
        console.log(`✅ Created ${turfs.length} turfs (8 approved, 2 pending)`);

        // =====================
        // CREATE BOOKINGS (12)
        // =====================
        const today = new Date();
        const bookings = await Booking.insertMany([
            {
                user: users[0]._id,
                turf: turfs[0]._id,
                date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
                startTime: '10:00',
                endTime: '12:00',
                totalAmount: 3000,
                status: 'booked',
            },
            {
                user: users[1]._id,
                turf: turfs[0]._id,
                date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
                startTime: '14:00',
                endTime: '16:00',
                totalAmount: 3000,
                status: 'booked',
            },
            {
                user: users[2]._id,
                turf: turfs[1]._id,
                date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
                startTime: '08:00',
                endTime: '11:00',
                totalAmount: 6000,
                status: 'booked',
            },
            {
                user: users[3]._id,
                turf: turfs[2]._id,
                date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
                startTime: '18:00',
                endTime: '20:00',
                totalAmount: 3600,
                status: 'booked',
            },
            {
                user: users[4]._id,
                turf: turfs[3]._id,
                date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
                startTime: '07:00',
                endTime: '09:00',
                totalAmount: 1600,
                status: 'booked',
            },
            {
                user: users[5]._id,
                turf: turfs[4]._id,
                date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
                startTime: '16:00',
                endTime: '18:00',
                totalAmount: 2400,
                status: 'booked',
            },
            {
                user: users[0]._id,
                turf: turfs[5]._id,
                date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
                startTime: '10:00',
                endTime: '12:00',
                totalAmount: 2000,
                status: 'booked',
            },
            {
                user: users[1]._id,
                turf: turfs[6]._id,
                date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
                startTime: '19:00',
                endTime: '21:00',
                totalAmount: 2800,
                status: 'booked',
            },
            {
                user: users[6]._id,
                turf: turfs[0]._id,
                date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // Past
                startTime: '10:00',
                endTime: '12:00',
                totalAmount: 3000,
                status: 'booked',
            },
            {
                user: users[7]._id,
                turf: turfs[1]._id,
                date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
                startTime: '14:00',
                endTime: '16:00',
                totalAmount: 4000,
                status: 'booked',
            },
            {
                user: users[2]._id,
                turf: turfs[2]._id,
                date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
                startTime: '08:00',
                endTime: '10:00',
                totalAmount: 3600,
                status: 'cancelled',
            },
            {
                user: users[3]._id,
                turf: turfs[7]._id,
                date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
                startTime: '17:00',
                endTime: '19:00',
                totalAmount: 1800,
                status: 'booked',
            },
        ]);
        console.log(`✅ Created ${bookings.length} bookings`);

        // =====================
        // CREATE REVIEWS (10)
        // =====================
        const reviews = await Review.insertMany([
            {
                user: users[0]._id,
                turf: turfs[0]._id,
                rating: 5,
                title: 'Amazing turf!',
                comment: 'Best football turf in Mumbai. Well maintained grass and excellent facilities.',
            },
            {
                user: users[1]._id,
                turf: turfs[0]._id,
                rating: 4,
                title: 'Good experience',
                comment: 'Nice turf, parking was a bit crowded on weekends.',
            },
            {
                user: users[2]._id,
                turf: turfs[1]._id,
                rating: 5,
                title: 'Cricket lovers paradise',
                comment: 'Excellent pitch quality. Bowling machines are top notch.',
            },
            {
                user: users[3]._id,
                turf: turfs[2]._id,
                rating: 4,
                title: 'Versatile venue',
                comment: 'Great for corporate events. Multiple sports options available.',
            },
            {
                user: users[4]._id,
                turf: turfs[3]._id,
                rating: 5,
                title: 'Best badminton courts',
                comment: 'Professional quality courts. AC works perfectly.',
            },
            {
                user: users[5]._id,
                turf: turfs[4]._id,
                rating: 3,
                title: 'Decent but could improve',
                comment: 'Good location but facilities need upgrade.',
            },
            {
                user: users[6]._id,
                turf: turfs[5]._id,
                rating: 4,
                title: 'Nice tennis courts',
                comment: 'Good clay courts. Coaching available is a plus.',
            },
            {
                user: users[7]._id,
                turf: turfs[6]._id,
                rating: 5,
                title: 'Perfect for corporates',
                comment: 'Cafeteria and meeting rooms make it ideal for team outings.',
            },
            {
                user: users[0]._id,
                turf: turfs[7]._id,
                rating: 4,
                title: 'Good basketball court',
                comment: 'Professional setup. Wish they had more slots available.',
            },
            {
                user: users[1]._id,
                turf: turfs[2]._id,
                rating: 5,
                title: 'Highly recommend',
                comment: 'Been coming here for months. Never disappointed.',
            },
        ]);
        console.log(`✅ Created ${reviews.length} reviews`);

        // =====================
        // UPDATE TURF RATINGS
        // =====================
        // Trigger rating calculation for turfs with reviews
        const turfIds = [...new Set(reviews.map(r => r.turf.toString()))];
        for (const turfId of turfIds) {
            await Review.calculateAverageRating(new mongoose.Types.ObjectId(turfId));
        }
        console.log(`✅ Updated ratings for ${turfIds.length} turfs`);

        // =====================
        // SUMMARY
        // =====================
        console.log('\n========================================');
        console.log('🎉 SEED COMPLETE! Summary:');
        console.log('========================================');
        console.log(`👥 Owners:   ${owners.length} (password: password123)`);
        console.log(`👤 Users:    ${users.length} (password: password123)`);
        console.log(`🏟️  Turfs:    ${turfs.length} (8 approved, 2 pending)`);
        console.log(`📅 Bookings: ${bookings.length}`);
        console.log(`⭐ Reviews:  ${reviews.length}`);
        console.log('========================================');
        console.log('\n📧 Test Login Credentials:');
        console.log('   Owner:  owner1@test.com / password123');
        console.log('   User:   user1@test.com / password123');
        console.log('   Admin:  sagartest@gmail.com (already exists)');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Seed Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run seed
connectDB().then(seedData);
