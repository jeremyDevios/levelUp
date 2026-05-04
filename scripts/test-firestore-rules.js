/*
Firestore security rules tests for Sprint 2
Run this against the Firebase emulator.

Setup:
  npm install -D @firebase/rules-unit-testing firebase-admin firebase
  npm run emulators:start  (or firebase emulators:start) with Firestore emulator running

Run:
  node ./scripts/test-firestore-rules.js

This script asserts:
 - Authenticated user may write to /users/{uid}/sessions/{sessionId} when uid matches
 - ServerTimestamp sentinel is accepted when writing createdAt
 - Authenticated user may NOT write to another user's sessions
 - Unauthenticated users may read /machines but may NOT create machine docs
*/

const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} = require('@firebase/rules-unit-testing');

(async () => {
  // Project id used by the emulator
  const projectId = 'levelup-emulator';

  // Load rules file from repository
  const rulesPath = path.join(__dirname, '..', 'firebase', 'firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules
    }
  });

  try {
    // Contexts
    const alice = testEnv.authenticatedContext('alice').firestore();
    const attacker = testEnv.authenticatedContext('attacker').firestore();
    const unauth = testEnv.unauthenticatedContext().firestore();

    // Helper: write machine doc bypassing rules to seed data
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().collection('machines').doc('machine-1').set({
        name: 'Lathe 3000',
        public: true
      });
    });

    // 1) Allowed: alice writes to her sessions with serverTimestamp for createdAt
    console.log('Test: alice can create her own session with serverTimestamp...');
    await assertSucceeds(
      alice.collection('users').doc('alice').collection('sessions').doc('sess-1').set({
        machineId: 'machine-1',
        // Use the rules-unit-testing provided FieldValue via the firestore namespace
        createdAt: require('@firebase/rules-unit-testing').firestore.FieldValue.serverTimestamp()
      })
    );
    console.log('  ✓ allowed');

    // 2) Denied: attacker attempts to create session under alice
    console.log('Test: attacker cannot write to alice sessions...');
    await assertFails(
      attacker.collection('users').doc('alice').collection('sessions').doc('sess-2').set({
        machineId: 'machine-1',
        createdAt: new Date() // arbitrary timestamp should also be denied because of UID mismatch
      })
    );
    console.log('  ✓ denied as expected');

    // 3) Unauthenticated can read machines (public read)
    console.log('Test: unauthenticated can read machines...');
    await assertSucceeds(
      unauth.collection('machines').doc('machine-1').get()
    );
    console.log('  ✓ read allowed');

    // 4) Unauthenticated cannot create machines
    console.log('Test: unauthenticated cannot create machines...');
    await assertFails(
      unauth.collection('machines').doc('machine-2').set({ name: 'Malicious' })
    );
    console.log('  ✓ create denied');

    console.log('\nAll assertions completed. If no assertion failed, your rules behave as expected for the tested scenarios.');
  } catch (e) {
    console.error('Test run failed:', e);
    process.exitCode = 1;
  } finally {
    // Cleanup test environment
    await testEnv.cleanup();
  }
})();
