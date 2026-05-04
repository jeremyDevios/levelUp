/*
Firestore security rules tests for users/{uid}/weights subcollection
Run this against the Firebase emulator.

Setup:
  npm install -D @firebase/rules-unit-testing firebase-admin firebase
  npm run emulators:start  (or firebase emulators:start) with Firestore emulator running

Run:
  node ./scripts/test-firestore-weights.js

This script asserts:
 - Authenticated owner can create and read their weight document
 - Authenticated attacker cannot create or read another user's weight
 - Unauthenticated users cannot create weight documents
*/

const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');

(async () => {
  const projectId = 'levelup-emulator';

  const rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules }
  });

  try {
    const alice = testEnv.authenticatedContext('alice').firestore();
    const attacker = testEnv.authenticatedContext('attacker').firestore();
    const unauth = testEnv.unauthenticatedContext().firestore();

    // 1) Allowed: alice creates a weight entry with serverTimestamp for date
    console.log('Test: alice can create her own weight entry...');
    await assertSucceeds(
      alice.collection('users').doc('alice').collection('weights').doc('w1').set({
        weightKg: 72,
        date: require('@firebase/rules-unit-testing').firestore.FieldValue.serverTimestamp(),
        notes: 'Morning weigh-in'
      })
    );
    console.log('  ✓ create allowed');

    // 2) Allowed: alice can read her weight entry
    console.log('Test: alice can read her own weight entry...');
    await assertSucceeds(
      alice.collection('users').doc('alice').collection('weights').doc('w1').get()
    );
    console.log('  ✓ read allowed');

    // 3) Denied: attacker cannot create under alice
    console.log('Test: attacker cannot create weight under alice...');
    await assertFails(
      attacker.collection('users').doc('alice').collection('weights').doc('w2').set({
        weightKg: 80,
        date: new Date(),
        notes: 'I should not be able to write this'
      })
    );
    console.log('  ✓ create denied');

    // 4) Denied: attacker cannot read alice's weight entry
    console.log('Test: attacker cannot read alice weight entry...');
    await assertFails(
      attacker.collection('users').doc('alice').collection('weights').doc('w1').get()
    );
    console.log('  ✓ read denied');

    // 5) Denied: unauthenticated cannot create weights
    console.log('Test: unauthenticated cannot create weight entries...');
    await assertFails(
      unauth.collection('users').doc('alice').collection('weights').doc('w3').set({
        weightKg: 60,
        date: new Date()
      })
    );
    console.log('  ✓ unauth create denied');

    console.log('\nAll assertions completed. If no assertion failed, your rules behave as expected for the tested scenarios.');
  } catch (e) {
    console.error('Test run failed:', e);
    process.exitCode = 1;
  } finally {
    await testEnv.cleanup();
  }
})();
