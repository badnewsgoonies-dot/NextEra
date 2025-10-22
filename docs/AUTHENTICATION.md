# Authentication System

## Overview

The NextEra game now includes a complete authentication system with user registration, login, and session management. All user data is stored locally in the browser using localStorage.

## Features

### 🔐 User Registration
- Email, username, and password required
- Optional display name
- Password must be at least 6 characters
- Username must be at least 3 characters
- Email validation
- Duplicate username/email detection

### 🔑 User Login
- Username and password authentication
- Session persistence (30 days)
- Auto-login after registration
- Session validation on app load

### 👤 User Profile
- Display user info (username, email, display name)
- Avatar support (URL-based)
- Profile display in main menu
- Account creation date
- Last login timestamp

### 🚪 Logout
- Clear current session
- Return to login screen
- Session cleanup

## Architecture

### Components

#### `/src/types/auth.ts`
Type definitions for authentication:
- `User`: Public user data
- `UserCredentials`: Login data
- `RegisterData`: Registration data
- `AuthSession`: Session with token
- `AuthState`: Current authentication state

#### `/src/systems/AuthenticationSystem.ts`
Core authentication logic:
- User registration with validation
- Login with credential verification
- Session management
- Password hashing (simple demo - use bcrypt in production!)
- localStorage persistence
- Profile updates

#### `/src/contexts/AuthContext.tsx`
React Context for global auth state:
- `AuthProvider`: Wraps the app
- `useAuth()`: Hook to access auth state and methods
- Auto-restores session on app load

#### `/src/screens/LoginScreen.tsx`
Beautiful Golden Sun-inspired login UI:
- Username and password inputs
- Error display
- Link to registration
- Loading states

#### `/src/screens/RegisterScreen.tsx`
Beautiful registration UI:
- Email, username, password inputs
- Optional display name
- Password confirmation
- Validation and error display
- Link to login

#### `/src/components/UserProfile.tsx`
User profile display:
- Compact mode for header display
- Full mode for settings/profile page
- Avatar or initial badge
- User info display
- Logout button

### App Integration

The main `App.tsx` now has a two-tier structure:

```tsx
App (AuthProvider wrapper)
  └── AppContent
      ├── AuthFlow (when not authenticated)
      │   ├── LoginScreen
      │   └── RegisterScreen
      └── GameApp (when authenticated)
          └── All game screens...
```

## Usage

### Starting the App

1. **New Users**: 
   - Click "Create an Account"
   - Fill in email, username, and password
   - Optionally add a display name
   - Click "Begin Your Journey"
   - You'll be auto-logged in and taken to the main menu

2. **Returning Users**:
   - Enter your username and password
   - Click "Enter the Arena"
   - Your session will be remembered for 30 days

### During Gameplay

- Your username appears in the top-right corner of the main menu
- Click the logout button to sign out
- Your game saves are tied to your account (coming soon)

### User Profile

The compact profile in the menu shows:
- User avatar (or initial badge if no avatar)
- Display name or username
- Logout button

## Data Storage

All authentication data is stored in localStorage:

- **Users**: `nextera_users` - Array of all registered users
- **Current Session**: `nextera_current_session` - Active user session
- **Game Saves**: Associated with user ID (future feature)

### Data Format

```typescript
// User Storage
{
  id: "user_1729597200000_abc123",
  username: "warrior99",
  email: "warrior@example.com",
  passwordHash: "hash_abc123_8",
  createdAt: "2025-10-22T12:00:00.000Z",
  lastLogin: "2025-10-22T12:00:00.000Z",
  displayName: "The Warrior",
  avatarUrl: "https://..."
}

// Session Storage
{
  userId: "user_1729597200000_abc123",
  token: "token_1729597200000_def456",
  expiresAt: "2025-11-21T12:00:00.000Z"
}
```

## Security Notes

⚠️ **Current Implementation**: This is a demo/prototype authentication system suitable for local browser storage.

### Current Security Features:
- Password hashing (simple hash)
- Session tokens
- Session expiration
- Input validation
- XSS-safe React rendering

### For Production, You Should:
1. **Use proper password hashing**: bcrypt, scrypt, or Argon2
2. **Implement backend authentication**: Don't store passwords in browser
3. **Use HTTPS**: Encrypt all traffic
4. **Add rate limiting**: Prevent brute force attacks
5. **Use secure tokens**: JWT with proper signing
6. **Add email verification**: Confirm user emails
7. **Implement 2FA**: Two-factor authentication
8. **Add password reset**: Secure recovery flow
9. **Audit logging**: Track authentication events
10. **CSRF protection**: Prevent cross-site attacks

## API Reference

### useAuth() Hook

```typescript
const {
  authState,     // Current auth state
  login,         // (username, password) => Promise<void>
  register,      // (email, username, password, displayName?) => Promise<void>
  logout,        // () => Promise<void>
  updateProfile  // (updates) => Promise<void>
} = useAuth();
```

### AuthenticationSystem Methods

```typescript
// Register new user
await authSystem.register({
  email: "user@example.com",
  username: "username",
  password: "password123",
  displayName: "Display Name" // optional
});

// Login
const session = await authSystem.login({
  username: "username",
  password: "password123"
});

// Get current session
const session = authSystem.getCurrentSession();

// Get auth state
const state = authSystem.getAuthState();

// Update profile
await authSystem.updateProfile(userId, {
  displayName: "New Name",
  avatarUrl: "https://..."
});

// Logout
await authSystem.logout();
```

## Future Enhancements

- [ ] Backend integration with real API
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Social login (Google, GitHub, etc.)
- [ ] Profile picture upload
- [ ] Account settings page
- [ ] User statistics and achievements
- [ ] Friend system
- [ ] Leaderboards
- [ ] Multi-device sync

## Styling

The authentication screens use a Golden Sun-inspired theme:

- **Login Screen**: Amber/yellow gradient (warm, inviting)
- **Register Screen**: Purple/indigo gradient (new beginnings)
- **Consistent with game's aesthetic**: Medieval fantasy RPG vibes
- **Responsive design**: Works on all screen sizes
- **Accessible**: ARIA labels, keyboard navigation

## Testing

To test authentication:

1. Register a new account
2. Verify you're logged in (see profile in menu)
3. Logout
4. Login again with same credentials
5. Close browser and reopen (session should persist)
6. Wait 30 days and session should expire (or manually clear localStorage)

## Troubleshooting

### "Username already taken"
- Choose a different username

### "Invalid username or password"
- Double-check your credentials
- Passwords are case-sensitive

### Session expired
- Login again
- Sessions last 30 days

### Can't register
- Ensure all required fields are filled
- Password must be 6+ characters
- Username must be 3+ characters
- Email must be valid format

### Lost data
- Authentication data is stored in browser localStorage
- Clearing browser data will delete your account
- Use browser backup/sync if needed
