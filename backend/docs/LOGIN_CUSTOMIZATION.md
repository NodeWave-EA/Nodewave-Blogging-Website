# Login Page Customization

This document explains the custom login page features implemented for NodeWave Blog admin.

## Features Implemented

### 1. Registration Link on Login Page

- **Location**: Below the login form on `/admin/auth/login`
- **Text**: "Need an account? Create one here"
- **Target**: Links to `/admin/auth/register`
- **Styling**: Matches Strapi's design system

### 2. Register-Admin Route Protection

- **Purpose**: Prevents creation of multiple Super Admins
- **Behavior**:
  - If Super Admin exists: Redirects `/admin/auth/register-admin` to `/admin/auth/register`
  - If no Super Admin: Allows access to `/admin/auth/register-admin` for first admin
- **Implementation**: Custom middleware in `src/middlewares/admin-registration-control.js`

## Technical Implementation

### Login Page Script Injection

**File**: `/public/admin/login-customization.js`

- Automatically loaded on admin pages
- Detects login page and injects registration link
- Handles SPA navigation and route changes
- Uses MutationObserver for dynamic content

**Configuration**: `/src/admin/app.tsx`

```typescript
head: {
  script: [
    {
      src: '/admin/login-customization.js',
      defer: true,
    },
  ],
}
```

### Middleware Protection

**File**: `/src/middlewares/admin-registration-control.js`

- Intercepts requests to `/admin/auth/register-admin`
- Checks for existing Super Admin users
- Redirects or blocks based on Super Admin existence

**Registration**: `/config/server.ts`

```typescript
middlewares: [
  // ... other middlewares
  'global::admin-registration-control',
]
```

## User Experience

### New User Registration Flow

1. **User visits login page**: `/admin/auth/login`
2. **Sees registration link**: "Need an account? Create one here"
3. **Clicks link**: Redirected to `/admin/auth/register`
4. **Completes registration**: Automatically assigned "Author" role
5. **Logged in**: Can access content management features

### Admin Protection

1. **Super Admin tries register-admin**: Redirected to regular registration
2. **API calls to register-admin**: Blocked with 403 error
3. **First user**: Can still access register-admin to become Super Admin

## Styling

The registration link uses Strapi's design tokens:

- **Primary Color**: `#4945ff` (Strapi blue)
- **Hover Color**: `#271fe0` (Darker blue)
- **Background on Hover**: `#f6f6f9` (Light gray)
- **Font Size**: `14px`
- **Font Weight**: `500` (Medium)

## Security Considerations

1. **No Multiple Super Admins**: Middleware prevents unauthorized admin creation
2. **Graceful Degradation**: If script fails, users can still access `/admin/auth/register` directly
3. **Role Validation**: Registration hooks ensure proper role assignment
4. **Route Protection**: Both GET and POST requests to register-admin are controlled

## Troubleshooting

### Registration Link Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify script loading**: Look for `/admin/login-customization.js` in Network tab
3. **Clear browser cache** and reload admin page
4. **Check login page URL** - script only activates on `/admin/auth/login`

### Register-Admin Not Blocked

1. **Check server logs** for middleware messages
2. **Verify Super Admin exists** in admin panel Users section
3. **Restart Strapi** to reload middleware
4. **Check middleware registration** in `config/server.ts`

### Registration Link Styling Issues

1. **Browser compatibility**: Modern browsers support CSS custom properties
2. **Theme conflicts**: Script uses inline styles to avoid conflicts
3. **Custom styles**: Modify `/public/admin/login-customization.js` for changes

This implementation provides a seamless registration experience while maintaining security by preventing unauthorized Super Admin creation.
