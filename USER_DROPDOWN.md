# User Dropdown Component

A beautiful user dropdown component with logout functionality, positioned in the header next to the logo.

## Features

✅ **User Avatar Display**
- Shows user's profile image from Twitter
- Fallback gradient avatar with user icon if no image

✅ **User Info**
- Displays user's name and username
- Shows @username in dropdown

✅ **Dropdown Menu**
- Click to open/close
- Click outside to close automatically
- Smooth animations

✅ **Navigation**
- "My Creator Studio" link to /creator
- Logout button with confirmation

✅ **Responsive Design**
- Hides username on mobile (shows only avatar)
- Full info on desktop
- Mobile-friendly dropdown

✅ **Smart Loading States**
- Skeleton loader while checking auth
- No flash of wrong content

## Component Structure

### Files Created/Modified

**New Components:**
- `src/app/components/UserDropdown.js` - User dropdown component

**Updated Components:**
- `src/app/components/Header.js` - Added user dropdown integration

## Usage

The UserDropdown component is automatically shown in the Header when a user is logged in:

```jsx
// Automatically integrated in Header.js
import UserDropdown from './UserDropdown';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
    const { user, loading } = useAuth();

    return (
        <header>
            <div className="flex items-center justify-between">
                {/* Logo on left */}
                <Logo />

                {/* User dropdown on right */}
                <div>
                    {!loading && (
                        user ? (
                            <UserDropdown />
                        ) : (
                            <Button>Get Started</Button>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
```

## User Flow

### When Not Logged In
1. Header shows "Get Started" button
2. Button links to /login page
3. User can authenticate with Twitter

### When Logged In
1. Header shows user avatar and name
2. Clicking opens dropdown menu with:
   - User info (avatar, name, @username)
   - "My Creator Studio" link
   - Logout button
3. Clicking logout:
   - Calls `/api/auth/logout`
   - Clears JWT tokens
   - Redirects to /login

## Dropdown Menu Items

### User Info Section
- Profile image/avatar
- Full name
- @username
- Visual separator

### Menu Actions
1. **My Creator Studio**
   - Icon: User icon
   - Action: Navigate to /creator
   - Purpose: Quick access to main app

2. **Logout**
   - Icon: LogOut icon
   - Action: Logout and redirect
   - Color: Red to indicate destructive action

## Styling Features

### Colors
- Background: Matches app theme
- Border: Subtle border for definition
- Hover: Muted background on hover
- Logout: Red text for warning

### Animations
- Dropdown fade-in/out
- Chevron rotation (180° when open)
- Smooth transitions
- Hover effects

### Shadow & Depth
- Dropdown has elevation shadow
- Border for definition
- Backdrop for separation

## Responsive Behavior

**Desktop (md and up):**
- Shows avatar + name + chevron
- Full dropdown menu

**Mobile (< md):**
- Shows avatar + chevron only
- Name hidden to save space
- Same full dropdown menu

## Integration with Auth System

The dropdown uses the `useAuth()` hook which:
- Fetches user from `/api/auth/me`
- Provides loading state
- Handles logout via `/api/auth/logout`
- Auto-refreshes on token changes

## Example States

### Loading State
```jsx
<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
```

### Not Authenticated
```jsx
<Link href="/login">
    <Button>Get Started</Button>
</Link>
```

### Authenticated
```jsx
<UserDropdown />
// Shows full dropdown with user info
```

## Customization

### Add More Menu Items

Edit `UserDropdown.js`:

```jsx
<div className="py-1">
    {/* Existing items... */}

    {/* Add new item */}
    <Link
        href="/settings"
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50"
    >
        <Settings className="w-4 h-4" />
        <span>Settings</span>
    </Link>
</div>
```

### Change Avatar Style

Modify the avatar rendering:

```jsx
{user.profile_image ? (
    <img
        src={user.profile_image}
        alt={user.name}
        className="w-8 h-8 rounded-full object-cover border-2 border-primary"
    />
) : (
    // Custom fallback
)}
```

### Adjust Dropdown Width

Change the dropdown container:

```jsx
<div className="absolute right-0 mt-2 w-64 bg-card border...">
    {/* Dropdown content */}
</div>
```

## Testing

### Manual Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test Not Logged In:**
   - Visit http://localhost:3000
   - Should see "Get Started" button
   - Click to go to login

3. **Test Login:**
   - Go to /login
   - Sign in with Twitter
   - Should redirect back
   - Header should show avatar

4. **Test Dropdown:**
   - Click avatar in header
   - Dropdown should open
   - Shows user info correctly
   - Links work

5. **Test Logout:**
   - Click "Logout" in dropdown
   - Should redirect to /login
   - Should clear authentication
   - Header should show "Get Started" again

## Accessibility

- Keyboard navigation support
- Focus states
- ARIA labels (can be added)
- Click-outside to close
- Escape key to close (can be added)

## Security

- Uses httpOnly cookies for tokens
- No sensitive data in client state
- Logout clears all auth cookies
- Protected routes in middleware

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Supports all screen sizes
- Touch-friendly on mobile
- No special polyfills needed

## Future Enhancements

Potential additions:
- [ ] Keyboard shortcuts (Escape to close)
- [ ] User profile page link
- [ ] Account settings
- [ ] Theme switcher in dropdown
- [ ] Notifications badge
- [ ] Multiple account support
