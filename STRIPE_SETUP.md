# Stripe Setup Guide

## 1. Create Products in Stripe Dashboard

### Pro Plan
- Product name: "MyVSL Pro"
- Create two prices:
  - Monthly: $49/month → copy Price ID → STRIPE_PRO_MONTHLY_PRICE_ID
  - Annual: $468/year ($39/mo) → copy Price ID → STRIPE_PRO_ANNUAL_PRICE_ID

### Agency Plan
- Product name: "MyVSL Agency"
- Create two prices:
  - Monthly: $149/month → copy Price ID → STRIPE_AGENCY_MONTHLY_PRICE_ID
  - Annual: $1,428/year ($119/mo) → copy Price ID → STRIPE_AGENCY_ANNUAL_PRICE_ID

## 2. Set Environment Variables
Add to Vercel (all environments):
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRO_MONTHLY_PRICE_ID
- STRIPE_PRO_ANNUAL_PRICE_ID
- STRIPE_AGENCY_MONTHLY_PRICE_ID
- STRIPE_AGENCY_ANNUAL_PRICE_ID
- NEXT_PUBLIC_APP_URL=https://getmyvsl.com

## 3. Create Webhook in Stripe Dashboard
- URL: https://getmyvsl.com/api/stripe/webhook
- Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted
- Copy signing secret → STRIPE_WEBHOOK_SECRET

## 4. Verify
- Visit /billing → see upgrade buttons
- Click upgrade → redirects to Stripe Checkout
- After payment → redirected to /dashboard?upgraded=true
- User plan updated in database
