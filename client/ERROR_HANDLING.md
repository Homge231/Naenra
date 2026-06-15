# Error Handling Guide

This document outlines the comprehensive error handling system implemented in the ARENA.ENG frontend.

## Architecture

The error handling system consists of:

1. **Error Store** (`src/stores/errorStore.ts`) - Centralized error state management
2. **Error Notification Component** (`src/components/ErrorNotification.vue`) - Toast-based error display
3. **Error Boundary Composable** (`src/composables/useErrorBoundary.ts`) - Component-level error handling
4. **Error View** (`src/views/ErrorView.vue`) - Full-page error display
5. **Enhanced Auth Store** - Auth error handling with error store integration
6. **Form Validation** - Client-side validation in LoginView

## Usage Examples

### 1. Display a Toast Notification

```typescript
import { useErrorStore } from '@/stores/errorStore'

const errorStore = useErrorStore()

// Error notification
errorStore.addError({
  type: 'error',
  message: 'Login Failed',
  description: 'Invalid email or password',
  duration: 5000 // auto-dismiss after 5s
})

// Success notification
errorStore.addError({
  type: 'success',
  message: 'Login Successful',
  duration: 3000
})

// Info notification
errorStore.addError({
  type: 'info',
  message: 'Your session will expire in 5 minutes'
})

// Persistent error (no auto-dismiss)
errorStore.addError({
  type: 'warning',
  message: 'Something needs your attention',
  duration: 0
})
```

### 2. Error with Action Button

```typescript
errorStore.addError({
  type: 'error',
  message: 'Connection Lost',
  description: 'Failed to reach the server',
  duration: 0,
  action: {
    label: 'Retry',
    callback: () => {
      retryConnection()
    }
  }
})
```

### 3. Use Error Boundary in Components

```typescript
import { useErrorBoundary } from '@/composables/useErrorBoundary'

export default {
  setup() {
    const { captureAsyncError, captureError } = useErrorBoundary()

    async function fetchData() {
      const data = await captureAsyncError(
        () => api.getData(),
        'Failed to load data'
      )
      if (data) {
        // Handle success
      }
    }

    function syncOperation() {
      captureError(() => {
        // Synchronous code that might throw
        complexCalculation()
      }, 'Calculation failed')
    }

    return { fetchData, syncOperation }
  }
}
```

### 4. Handle Auth Errors (Already Integrated)

```typescript
// Errors in authStore are automatically caught and displayed
const result = await auth.loginWithEmail(email, password)
// Errors show as toast notifications

await auth.loginWithGoogle()
// OAuth errors show as toast notifications
```

### 5. Form Validation Errors (Already Integrated)

LoginView automatically shows inline validation errors:
- Email validation
- Password requirements
- Real-time error clearing

## Error Types

- **error**: Critical errors in red (default styling)
- **warning**: Warnings in yellow
- **info**: Informational messages in blue
- **success**: Success messages in green

## Error Notification UI

Errors appear as toast notifications in the top-right corner with:
- Icon indicating error type
- Error message (required)
- Description (optional)
- Action button (optional)
- Close button
- Auto-dismiss timer (configurable)

## Best Practices

1. **Always provide a user-friendly message** - Don't expose raw API errors
2. **Include context** - Use the `description` field for technical details
3. **Auto-dismiss non-critical errors** - Use default duration for transient issues
4. **Persist critical errors** - Use `duration: 0` for important alerts
5. **Catch async operations** - Wrap Promises in error handlers
6. **Log to console** - All errors are logged for debugging

## Global Error Handler

```typescript
import { useErrorStore } from '@/stores/errorStore'

const errorStore = useErrorStore()

// Handles any error and logs it
errorStore.handleError(error, 'Default message if error is unknown')
```

## Integration Points

### Auth Store
- Login errors (email/password)
- Google OAuth errors
- Session check failures
- Logout errors

### Login View
- Email validation
- Password validation
- Form submission errors

### API Calls
Use error boundary composable:
```typescript
const { captureAsyncError } = useErrorBoundary()
const result = await captureAsyncError(() => supabase.from('table').select())
```

## Testing Error Handling

To test the error system:

```typescript
// In browser console:
// Add a test error
$vm.errorStore.addError({
  type: 'error',
  message: 'Test Error',
  description: 'This is a test'
})
```

## Troubleshooting

- **Error notifications not showing**: Ensure `ErrorNotification` component is in `App.vue`
- **Types not recognized**: Check that error type is one of: `error | warning | info | success`
- **Auto-dismiss not working**: Verify `duration > 0` (0 means persistent)
