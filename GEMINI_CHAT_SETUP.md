## Gemini API & Chat History - Setup Complete ✅

### What Was Fixed

#### 1. **Gemini API Key Configuration** 
   - **Before**: Used `process.env.API_KEY` (Node.js only)
   - **After**: Uses `import.meta.env.VITE_GEMINI_API_KEY` (Vite frontend)
   
   **Files Updated**:
   - `.env.local`: Renamed `GEMINI_API_KEY` → `VITE_GEMINI_API_KEY`
   - `services/geminiService.ts`: Changed API key access method

#### 2. **Chat History Persistence**
   - New service: `services/chatHistory.ts`
   - Saves all chat messages to Firestore for logged-in users
   - Structure: `chats/{userId}/messages/{messageId}`
   
   **Files Updated**:
   - `components/GeminiChat.tsx`: Imports and calls `saveChatMessage()` after each user/model message
   - Only saves when user is authenticated (checks `userProfile?.id`)

---

### Firestore Collection Structure

```
chats/
├── {userId}/
│   ├── updatedAt: timestamp
│   └── messages/ (subcollection)
│       ├── {messageId}
│       │   ├── role: "user" | "model"
│       │   ├── text: string
│       │   ├── timestamp: timestamp (server)
│       │   └── createdAt: ISO string (client)
│       └── ...
```

---

### Firestore Rules (Required for Chat History)

Add this to your Firestore security rules:

```javascript
// Allow authenticated users to read/write their own chat history
match /chats/{userId} {
  allow read, write: if request.auth.uid == userId;
  
  match /messages/{messageId} {
    allow read, write: if request.auth.uid == userId;
  }
}
```

**Apply in Firebase Console**:
1. Go to Firestore Database → Rules
2. Add the rules above (alongside your existing `/users/{userId}` rules)
3. Click Publish

---

### How It Works

1. **User sends message** → `handleSend()` in GeminiChat
2. **Message saved to Firestore** → `saveChatMessage(userId, userMsg)`
3. **AI generates response** → `chatWithAssistant()`
4. **Response saved to Firestore** → `saveChatMessage(userId, aiResponse)`
5. **Both displayed in UI** → `setMessages(prev => [...])`

**Important**: Messages only save if:
- User is logged in (`userProfile?.id` exists)
- Firestore is accessible and rules allow write
- If save fails, chat still works (logs error, doesn't throw)

---

### Testing Locally

1. **Frontend running**: `npm run dev` (port 5173)
2. **Backend running**: `node index.js` in `/backend` (port 4000)
3. **Login** to the app with email/phone/guest
4. **Open chat** by clicking "Talk to Specialist" button
5. **Send message** → Check Firestore console to see messages saved

---

### Deployment Notes

**For Netlify**:
- Add environment variable: `VITE_GEMINI_API_KEY=AIzaSyB5z3jqC49m7fIolKXQHYfKilfBQV1N52k`
- Vite automatically exposes `VITE_*` variables to the browser

**For Firebase**:
- Ensure Firestore security rules include the chat history permissions above
- Test rules in Firebase Console before deploying to production

---

### Files Changed Summary

| File | Change | Why |
|------|--------|-----|
| `.env.local` | `GEMINI_API_KEY` → `VITE_GEMINI_API_KEY` | Vite naming convention for frontend exposure |
| `services/geminiService.ts` | `process.env` → `import.meta.env` | Frontend needs import.meta.env, not Node.js process.env |
| `components/GeminiChat.tsx` | Added import + save calls | Persist chat history on each message |
| `services/chatHistory.ts` | New file | Service to save/manage chat messages in Firestore |

All systems are **ready for local testing**! 🚀
