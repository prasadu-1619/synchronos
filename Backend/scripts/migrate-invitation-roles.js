import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const updateInvitationRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const invitationsCollection = db.collection('invitations');

    // Update all 'editor' roles to 'member'
    const result = await invitationsCollection.updateMany(
      { role: 'editor' },
      { $set: { role: 'member' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} invitations from 'editor' to 'member'`);

    // Show remaining invitations
    const remaining = await invitationsCollection.find({}).toArray();
    console.log('\n📋 Current invitations:');
    remaining.forEach((inv) => {
      console.log(`   - ${inv.email}: ${inv.role} (${inv.status})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating invitations:', error);
    process.exit(1);
  }
};

// Run the migration
updateInvitationRoles();
