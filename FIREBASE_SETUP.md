# Firebase Setup Guide

This app uses Firebase Firestore for real-time data synchronization. When you remove a theme or add a problem, all users will see the changes **instantly** without needing to refresh or wait for deployments.

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (you can disable Google Analytics if you want)

### 2. Enable Firestore Database

1. In your Firebase project, look at the left sidebar
2. Find and click on **"Build"** (or the building/construction icon)
3. Under "Build", click on **"Firestore Database"**
   - If you don't see "Build", look for **"Firestore Database"** directly in the left sidebar
4. Click **"Create database"** button
5. Choose **Start in test mode** (for development)
   - This allows read/write access for 30 days (perfect for testing)
6. Select a location (choose closest to your users, e.g., `us-central`, `europe-west`, `asia-southeast1`)
7. Click **"Enable"**
8. Wait for the database to be created (takes a few seconds)

### 3. Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (`</>`)
4. Register your app (give it a nickname like "Python Learn App")
5. Copy the `firebaseConfig` object

### 4. Configure Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example`)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

3. Replace the placeholder values with your actual Firebase config values

### 5. Set Up Firestore Security Rules (Important!)

**How to find Security Rules:**

**Method 1 (Most Common):**
1. In Firebase Console, make sure you're in your project
2. Look at the **left sidebar menu**
3. Find and click on **"Firestore Database"** (it might be under "Build" section or directly visible)
4. Once you're in Firestore Database, look at the **top of the page** - you'll see tabs:
   - **"Data"** tab (shows your database content)
   - **"Indexes"** tab (for database indexes)
   - **"Rules"** tab ← **Click this one!**
5. Click on the **"Rules"** tab
6. You'll see a code editor with the current security rules

**Method 2 (If you don't see Firestore Database):**
1. In the left sidebar, look for **"Build"** (construction/building icon)
2. Click on **"Build"** to expand it
3. Click on **"Firestore Database"** under Build
4. Then click the **"Rules"** tab at the top

**Method 3 (Direct URL):**
- After creating Firestore, the Rules tab should be visible
- If you still can't see it, make sure you've completed Step 2 (Enable Firestore Database)
- The Rules tab only appears after Firestore is created

**What you should see:**
- A code editor with text like `rules_version = '2';`
- A "Publish" button at the top
- This is where you'll paste the rules below

Once you're in the Rules tab, **REPLACE ALL THE EXISTING RULES** with this:

**⚠️ IMPORTANT: Your app uses localStorage authentication (NOT Firebase Auth), so you MUST use these open rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Allow all (ONLY FOR TESTING!)
    }
  }
}
```

**Steps to apply the rules:**
1. **Copy the rules above** (the entire code block from `rules_version` to the closing `}`)
2. **Delete all existing rules** in the Firebase Rules editor (select all and delete)
3. **Paste the new rules** into the editor
4. **Click the "Publish" button** (top right of the editor, usually blue/green)
5. **Wait 10-30 seconds** for rules to propagate across Firebase servers
6. **Try deleting a theme again** - it should work now!

⚠️ **Why these rules?**
- Your app uses **localStorage** for authentication (NOT Firebase Authentication)
- Rules checking `request.auth != null` will **ALWAYS fail** because there's no Firebase user
- These open rules allow anyone to read/write (required for your current setup)
- For production later, you can implement Firebase Authentication and update rules

**If you get "Missing or insufficient permissions" error:**
- ✅ Make sure you **deleted all old rules** and pasted the new ones completely
- ✅ Make sure you clicked **"Publish"** button (not just Save - look for a blue/green button at top)
- ✅ Wait **10-30 seconds** after publishing (rules need time to propagate)
- ✅ Check browser console - you should see `✅ Themes saved to Firestore successfully` after fix
- ✅ If still failing, refresh Firebase Console and check the Rules tab shows your new rules

**If you still can't find Rules:**

1. **Make sure Firestore is created**: Go back to Step 2 and ensure you clicked "Enable" and the database was created successfully. You should see "No data yet" or an empty table in the Data tab.

2. **Check the URL**: You should be at `console.firebase.google.com/project/YOUR-PROJECT/firestore`

3. **Look for tabs at the top**: When you're in Firestore Database, at the very top of the page (above the data table), you should see 3 clickable tabs:
   - **"Data"** (usually selected by default, shows your database)
   - **"Indexes"** (for database performance)
   - **"Rules"** ← **This is what you need!**

4. **Visual guide**: 
   - Left sidebar: Click "Firestore Database"
   - Top of page: You'll see tabs like: `[Data] [Indexes] [Rules]`
   - Click on `[Rules]` tab

5. **If Rules tab is missing**:
   - Make sure you completed Step 2 (database creation)
   - Try refreshing the browser (F5)
   - Clear browser cache
   - Make sure you're using a modern browser (Chrome, Firefox, Edge)

6. **Alternative locations** (older Firebase console versions):
   - Some versions have Rules under "Project Settings" > "Service accounts"
   - Or look for "Security Rules" in the left sidebar under Firestore

**Quick test**: If you can see the "Data" tab and "Indexes" tab, the "Rules" tab should be right next to them!

### 6. Initialize Data

When you first run the app with Firebase configured:
- The app will automatically initialize Firestore with data from your JSON files
- After that, all changes will be saved to Firestore in real-time

## How It Works

### Real-Time Updates
- When Admin A removes a theme → Saved to Firestore
- Admin B, Student C, and all other users → See the change **instantly** (within seconds)
- No git commits, no deployments needed for data changes!

### Fallback Mode
- If Firebase is not configured, the app falls back to JSON files
- Works exactly as before (requires git commits for updates)

### Data Structure in Firestore

```
problems/
  └── data (document)
      ├── basic: [array of problems]
      ├── logical: [array of problems]
      └── ...

themes/
  └── data (document)
      └── themes: [array of themes]
```

## Firebase Free Tier Limits

Firebase Free (Spark) plan includes:
- ✅ 50K reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day
- ✅ 1 GB storage
- ✅ Real-time updates

This is **more than enough** for a learning platform with hundreds of students!

## Troubleshooting

### "Firebase not configured" warning
- Check that your `.env` file exists and has correct values
- Restart your dev server after adding `.env` file
- Make sure variable names start with `VITE_`

### Data not syncing
- Check Firestore security rules
- Check browser console for errors
- Verify Firebase project is active in Firebase Console

### Initial data not loading
- The app will auto-initialize on first run
- You can also manually add data through Firebase Console

## Benefits

✅ **Real-time**: Changes visible instantly to all users  
✅ **No backend needed**: Firebase handles everything  
✅ **Free tier**: Perfect for small to medium projects  
✅ **Offline support**: Works offline with caching  
✅ **Scalable**: Can grow with your needs  

