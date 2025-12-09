# Applink CaaS Setup Guide

## Current Status
Your backend is now configured with better error handling, but still needs **valid Applink credentials** to work properly.

## What You Need from Applink

To make the Banglalink payment integration work, you must obtain these from Applink (https://applink.com.bd/):

1. **CAAS_APP_ID** - Your CaaS application ID (format: `APP_XXXXXXX`)
2. **CAAS_PASSWORD** - Your CaaS API password/key
3. **APPLINK_SOURCE_ADDRESS** - Your registered sender address (format: `tel:+8801XXXXXXX`)

## Setup Steps

### 1. Contact Applink Support
- Visit: https://applink.com.bd/
- Request CaaS (Charging as a Service) credentials
- They will provide you with the above credentials

### 2. Update `.env` File
Replace the placeholder values in `backend/.env`:

```env
# Before (Placeholder)
CAAS_APP_ID=APP_xxxxx
CAAS_PASSWORD=<API key from Applink>
APPLINK_SOURCE_ADDRESS=tel:+8801xxxxxx

# After (Your actual credentials)
CAAS_APP_ID=APP_YOUR_ACTUAL_ID
CAAS_PASSWORD=YOUR_ACTUAL_PASSWORD
APPLINK_SOURCE_ADDRESS=tel:+880XXXXXXXXX
```

### 3. Verify Configuration
Once you've updated the `.env` file, test the health endpoint:

```bash
cd backend
npm start
# Then in another terminal:
curl http://localhost:4000/api/health
```

Expected response if configured correctly:
```json
{
  "ok": true,
  "credentials": "configured",
  "appId": "APP_****",
  "caasEndpoint": "https://api.applink.com.bd/caas/direct/debit"
}
```

## Error Codes Reference

| Status | Meaning | Solution |
|--------|---------|----------|
| 503 | Credentials not configured | Update `.env` with real Applink credentials |
| 402 | Payment failed | Check phone number format & account balance |
| 500 | Network/server error | Check internet connection & Applink API status |

## Phone Number Format

Your app expects Bangladeshi phone numbers in one of these formats:
- `8801XXXXXXXXX` (without country code)
- `+8801XXXXXXXXX` (with country code)
- `tel:+8801XXXXXXXXX` (full tel format)

All will be normalized to `tel:+8801XXXXXXXXX` internally.

## Charging Notification Webhook

The webhook URL mentioned in your CaaS configuration should be set to:
```
https://digiphysioweb.onrender.com/caas/chargingNotification
```

(or your actual deployment URL when available)

## Important Notes

⚠️ **Without valid Applink credentials, the Banglalink registration flow WILL NOT WORK**

The system now has:
- ✅ Better error messages for missing credentials
- ✅ Proper status code responses (503 for config issues, 402 for payment issues)
- ✅ Detailed logging for debugging
- ✅ Email/password registration as fallback option

Users can still use the email registration option while you complete Applink setup.
