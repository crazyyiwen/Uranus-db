# DataModelService

A global data model manager service for Node.js/TypeScript applications with immutability, change tracking, and event notifications.

## Features

- **Singleton Pattern**: Global access throughout the application
- **Immutability**: Data changes create new copies (configurable)
- **Change Tracking**: Full history of all changes with patch system
- **Event System**: Listen to data changes in real-time
- **Path-based Access**: Get/Set nested data using dot notation or array paths
- **Undo Functionality**: Apply patches to revert changes
- **Type-safe**: Full TypeScript support

## Installation

The service is already included in the project. Import it like this:

```typescript
import dataModelService from './services/DataModelService';
```

## Basic Usage

### Register a Data Model

```typescript
// Register with initial data
dataModelService.registerDataModel('user', {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
});

// Register empty model
dataModelService.registerDataModel('settings', {});
```

### Set Data

```typescript
// Using dot notation
dataModelService.setIn('user', 'profile.age', 30);

// Using array notation
dataModelService.setIn('user', ['profile', 'address', 'city'], 'New York');

// Set nested objects (auto-creates path)
dataModelService.setIn('settings', 'theme.mode', 'dark');
```

### Get Data

```typescript
// Get by path
const userName = dataModelService.getIn('user', 'name');
const city = dataModelService.getIn('user', ['profile', 'address', 'city']);

// Get entire model
const user = dataModelService.getById('user');
```

### Check Existence

```typescript
// Check if model exists
const hasUser = dataModelService.has('user');

// Check if path exists
const hasEmail = dataModelService.hasIn('user', 'email');
const hasPhone = dataModelService.hasIn('user', 'profile.phone');
```

## Advanced Features

### Listen to Changes

```typescript
// Subscribe to all store changes
dataModelService.onStoreChange((change) => {
  console.log('Store ID:', change.patch.storeId);
  console.log('Operation:', change.patch.operation); // 'register', 'edit', 'delete'
  console.log('Path:', change.patch.patchedPath);
  console.log('New Value:', change.patch.patchedValue);
  console.log('Previous Value:', change.patch.previousValue);
});

// Unsubscribe
const listener = (change) => { /* ... */ };
dataModelService.onStoreChange(listener);
dataModelService.offStoreChange(listener);
```

### Change History

```typescript
// Get all changes
const history = dataModelService.getStoreChanges();

// Each patch contains:
history.forEach(patch => {
  console.log({
    patchId: patch.patchId,
    storeId: patch.storeId,
    operation: patch.operation,
    patchedPath: patch.patchedPath,
    patchedValue: patch.patchedValue,
    previousValue: patch.previousValue,
    timestamp: patch.timestamp
  });
});
```

### Undo Changes (Apply Patch)

```typescript
// Make changes
dataModelService.setIn('counter', 'value', 10);
dataModelService.setIn('counter', 'value', 20);

// Get last change
const history = dataModelService.getStoreChanges();
const lastPatch = history[history.length - 1];

// Undo last change
dataModelService.applyPatch(lastPatch.patchId);
```

### Deregister Model

```typescript
// Remove a data model and all its history
dataModelService.deregisterDataModel('user');
```

### List All Models

```typescript
// Get all registered model IDs
const allModels = dataModelService.getAllDataModelIds();
console.log('Models:', allModels); // ['user', 'settings', 'cart']
```

### Clear Everything

```typescript
// Clear all models and history
dataModelService.clearAll();
```

## Advanced Options

### Overwrite Existing Model

```typescript
// Will throw error if model exists
dataModelService.registerDataModel('user', { name: 'John' });

// Overwrite existing model
dataModelService.registerDataModel('user', { name: 'Jane' }, true);
```

### Mutable Mode

By default, data is deep cloned for immutability. Use mutable mode to store references:

```typescript
const sharedData = { count: 0 };

// Mutable registration (no deep clone)
dataModelService.registerDataModel('shared', sharedData, false, true);

// Changes to sharedData will reflect in the store
sharedData.count = 10;
console.log(dataModelService.getById('shared')); // { count: 10 }
```

## Use Cases

### 1. Session Management

```typescript
dataModelService.registerDataModel('session', {});
dataModelService.setIn('session', 'userId', 'user-123');
dataModelService.setIn('session', 'token', 'jwt-token');
dataModelService.setIn('session', 'expiresAt', Date.now() + 3600000);

// Check session
const token = dataModelService.getIn('session', 'token');
const isExpired = dataModelService.getIn('session', 'expiresAt') < Date.now();
```

### 2. Application Configuration

```typescript
dataModelService.registerDataModel('config', {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 5000
  },
  features: {
    analytics: true,
    darkMode: false
  }
});

// Access config anywhere
const apiUrl = dataModelService.getIn('config', 'api.baseUrl');
```

### 3. Shopping Cart

```typescript
dataModelService.registerDataModel('cart', {
  items: [],
  total: 0
});

// Add item
const items = dataModelService.getIn('cart', 'items') || [];
items.push({ id: 1, name: 'Product', price: 10 });
dataModelService.setIn('cart', 'items', items);
dataModelService.setIn('cart', 'total', 10);
```

### 4. Cache/Temporary Data

```typescript
dataModelService.registerDataModel('cache', {});

// Store API response
dataModelService.setIn('cache', ['api', 'users'], apiResponse);

// Check cache
if (dataModelService.hasIn('cache', ['api', 'users'])) {
  return dataModelService.getIn('cache', ['api', 'users']);
}
```

## API Reference

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `registerDataModel` | `(id, data, overwrite?, isMutable?)` | Register a new data model |
| `deregisterDataModel` | `(id)` | Remove a data model |
| `has` | `(id)` | Check if model exists |
| `hasIn` | `(id, path)` | Check if path exists in model |
| `getById` | `(id)` | Get entire model |
| `getIn` | `(id, path)` | Get data at path |
| `setIn` | `(id, path, value)` | Set data at path |
| `extend` | `(id, path, value, overwrite?)` | Extend data at path |
| `applyPatch` | `(patchId)` | Apply a patch (undo) |
| `getStoreChanges` | `()` | Get all change history |
| `getAllDataModelIds` | `()` | Get all model IDs |
| `clearAll` | `()` | Clear all models |
| `onStoreChange` | `(listener)` | Subscribe to changes |
| `offStoreChange` | `(listener)` | Unsubscribe from changes |

### Types

```typescript
type Segments = string | string[];

enum StoreAction {
  register = 'register',
  edit = 'edit',
  delete = 'delete'
}

interface IStorePatch {
  patchId: string;
  storeId: string;
  firstChange: boolean;
  timestamp: number;
  patchedPath?: string;
  patchedSegments?: string[];
  patchedValue?: any;
  previousValue?: any;
  operation: StoreAction;
  innerAction: boolean;
}

interface IStoreChange {
  store: Map<string, any> | undefined;
  patch: IStorePatch;
}
```

## Best Practices

1. **Use meaningful IDs**: Choose clear, descriptive IDs for data models
2. **Path notation**: Use dot notation for simple paths, array for dynamic paths
3. **Listen selectively**: Filter store changes by `storeId` if needed
4. **Clean up**: Deregister models when no longer needed
5. **Immutability**: Keep default immutable mode unless you have specific reasons
6. **Type safety**: Define interfaces for your data models

## Examples

See `DataModelService.example.ts` for comprehensive usage examples.
