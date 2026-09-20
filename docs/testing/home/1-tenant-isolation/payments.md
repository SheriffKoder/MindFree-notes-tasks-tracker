# Tenant isolation — Payments

Part of [Home — Tenant isolation](./README.md).

Home has **no payment list** — isolation is write attribution from the bill icon.

## How it happens + where it can break

### View — (none on Home)

No Home payment read list.

---

### Edit — create payment

[1] HomePaymentQuickAdd to open the payment create drawer [@views/home/ui/home-payment-quick-add.tsx](../../../../views/home/ui/home-payment-quick-add.tsx)  
! failure: create flow continues without an authenticated session  
↓  
[2] useCreatePaymentMutation to run the create mutation [@entities/payment/hooks/use-create-payment-mutation.ts](../../../../entities/payment/hooks/use-create-payment-mutation.ts)  
↓  
[3] fetchPostPayment to POST /api/payments with the draft fields [@entities/payment/client/post-payment.ts](../../../../entities/payment/client/post-payment.ts)  
↓  
[4] POST /api/payments that resolves session userId via requireAuthenticatedUserId [@app/api/payments/route.ts](../../../../app/api/payments/route.ts)  
! failure: no session still creates, or body supplies userId  
↓  
[5] createPayment to insert a payment owned by that userId [@entities/payment/mutations/create-payment.ts](../../../../entities/payment/mutations/create-payment.ts)  
! failure: create runs without session userId  
↓  
[6] repository INSERT that sets mf_payments.user_id from the session [@entities/payment/repository/create-payment.ts](../../../../entities/payment/repository/create-payment.ts)  
! failure: INSERT uses client userId or omits user_id

**Soft spot:** body carries title/amount/date/group only — owner must stay server-derived.
