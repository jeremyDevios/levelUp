/*
  Test script for Sprint 4 Firestore + Storage rules
  - Requires: Node 16+, install dev dependencies:
      npm install --save-dev @firebase/rules-unit-testing firebase
  - Run with:
      node ./scripts/test-firestore-sprint4.js

  This script uses @firebase/rules-unit-testing to load rules from firebase/firestore.rules
  and firebase/storage.rules and validates allow/deny cases for session update/delete and
  machine image uploads.
*/

const fs = require('fs');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');

const PROJECT_ID = 'levelup-sprint4-tests';

(async () => {
  const firestoreRules = fs.readFileSync('firebase/firestore.rules', 'utf8');
  const storageRules = fs.readFileSync('firebase/storage.rules', 'utf8');

  console.log('Initializing test environment...');
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules },
    storage: { rules: storageRules }
  });

  // Contexts
  const ownerUid = 'owner-uid-1';
  const otherUid = 'other-uid-2';

  const owner = testEnv.authenticatedContext(ownerUid, { uid: ownerUid });
  const other = testEnv.authenticatedContext(otherUid, { uid: otherUid });
  const unauth = testEnv.unauthenticatedContext();

  const ownerDb = owner.firestore();
  const otherDb = other.firestore();

  // Prepare a valid session payload
  const sessionPath = ownerDb.collection('users').doc(ownerUid).collection('sessions').doc('session1');
  const validSession = {
    title: 'Morning Workout',
    duration: 1800,
    restSeconds: 60,
    sets: [ { name: 'A', reps: 10 }, { name: 'B', reps: 8 } ],
    createdAt: { _seconds: Math.floor(Date.now()/1000) }
  };

  try {
    console.log('1) Owner should be able to create a valid session');
    await assertSucceeds(sessionPath.set(validSession));

    console.log('2) Other user should NOT be able to update the owner\'s session');
    await assertFails(otherDb.collection('users').doc(ownerUid).collection('sessions').doc('session1').update({ title: 'hacked' }));

    console.log('3) Owner should be able to update with valid payload');
    await assertSucceeds(ownerDb.collection('users').doc(ownerUid).collection('sessions').doc('session1').update({ title: 'Morning Routine v2', restSeconds: 90 }));

    console.log('4) Owner update with invalid restSeconds type should be rejected');
    await assertFails(ownerDb.collection('users').doc(ownerUid).collection('sessions').doc('session1').update({ restSeconds: 'sixty' }));

    console.log('5) Other user should NOT be able to delete the owner\'s session');
    await assertFails(otherDb.collection('users').doc(ownerUid).collection('sessions').doc('session1').delete());

    console.log('6) Owner should be able to delete their session');
    await assertSucceeds(ownerDb.collection('users').doc(ownerUid).collection('sessions').doc('session1').delete());

    // Storage tests
    const ownerStorage = owner.storage();
    const otherStorage = other.storage();
    const unauthStorage = unauth.storage();

    const smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'; // short base64 fragment (small)
    console.log('7) Authenticated user should be able to upload a machine image (image/png)');
    await assertSucceeds(ownerStorage.ref('machines/m1/images/pic.png').putString(smallImage, 'data_url'));

    console.log('8) Unauthenticated user should NOT be able to upload a machine image');
    await assertFails(unauthStorage.ref('machines/m1/images/pic2.png').putString(smallImage, 'data_url'));

    console.log('9) Authenticated user should NOT be able to upload non-image content (e.g., text/plain)');
    // putString with a data_url but force content type mismatch by using raw string and metadata
    await assertFails(ownerStorage.ref('machines/m1/images/evil.txt').putString('hello world', 'raw', { contentType: 'text/plain' }));

    console.log('\nAll rule assertions ran. If any assertion above failed an exception was thrown.');
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await testEnv.cleanup();
    process.exit(0);
  }
})();
