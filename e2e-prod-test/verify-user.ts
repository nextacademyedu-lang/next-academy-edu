import { test, request } from '@playwright/test';
import { queryCollection, updateDocumentAsAdmin } from './test-utils';

async function verifyUser() {
  const apiContext = await request.newContext();
  const users = await queryCollection(apiContext, 'users', 'where[email][equals]=b2b_mgr_manual_999@mail.test');
  if (users.docs.length > 0) {
    const userId = users.docs[0].id;
    await updateDocumentAsAdmin(apiContext, 'users', userId, { verified: true, role: 'b2b_manager' });
    console.log('--- USER_VERIFIED ---');
  } else {
    console.log('--- USER_NOT_FOUND ---');
  }
}

verifyUser().catch(console.error);
