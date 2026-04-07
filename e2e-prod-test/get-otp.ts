import { test, request } from '@playwright/test';
import { queryCollection } from './test-utils';

async function fetchOtp() {
  const apiContext = await request.newContext();
  const codes = await queryCollection(apiContext, 'verification-codes', 'where[email][equals]=b2b_mgr_manual_999@mail.test&sort=-createdAt&limit=1');
  if (codes.docs.length > 0) {
    console.log('--- OTP_GENERATED ---');
    console.log(codes.docs[0].code);
    console.log('---------------------');
  } else {
    console.log('--- OTP_NOT_FOUND ---');
  }
}

fetchOtp().catch(console.error);
