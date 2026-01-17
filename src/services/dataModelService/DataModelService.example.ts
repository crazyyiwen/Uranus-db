/**
 * Example usage of DataModelService
 * This file demonstrates how to use the global DataModelService
 */

import dataModelService from './DataModelService';

// Example 1: Register and manage user data
export function example1_UserDataModel() {
  console.log('\n=== Example 1: User Data Model ===');

  // Register user model
  dataModelService.registerDataModel('user', {
    id: 'user-123',
    profile: {
      name: 'John Doe',
      email: 'john@example.com'
    }
  });

  // Set nested data
  dataModelService.setIn('user', 'profile.age', 30);
  dataModelService.setIn('user', ['profile', 'address', 'city'], 'New York');

  // Get data
  const userName = dataModelService.getIn('user', 'profile.name');
  const userAge = dataModelService.getIn('user', 'profile.age');

  console.log('User Name:', userName);
  console.log('User Age:', userAge);
  console.log('Full User:', dataModelService.getById('user'));
}

// Example 2: Listen to store changes
export function example2_ListenToChanges() {
  console.log('\n=== Example 2: Listen to Changes ===');

  // Register change listener
  dataModelService.onStoreChange((change) => {
    console.log('Store changed:', {
      storeId: change.patch.storeId,
      operation: change.patch.operation,
      path: change.patch.patchedPath,
      newValue: change.patch.patchedValue,
      previousValue: change.patch.previousValue
    });
  });

  // Register and modify data
  dataModelService.registerDataModel('settings', {
    theme: 'light',
    language: 'en'
  });

  dataModelService.setIn('settings', 'theme', 'dark');
  dataModelService.setIn('settings', 'language', 'fr');
}

// Example 3: Check existence and history
export function example3_CheckAndHistory() {
  console.log('\n=== Example 3: Check Existence and History ===');

  dataModelService.registerDataModel('config', {
    api: {
      baseUrl: 'https://api.example.com'
    }
  });

  // Check if data model exists
  console.log('Has config:', dataModelService.has('config'));
  console.log('Has unknown:', dataModelService.has('unknown'));

  // Check if path exists
  console.log('Has api.baseUrl:', dataModelService.hasIn('config', 'api.baseUrl'));
  console.log('Has api.timeout:', dataModelService.hasIn('config', 'api.timeout'));

  // Make changes
  dataModelService.setIn('config', 'api.timeout', 5000);
  dataModelService.setIn('config', 'api.retries', 3);

  // Get change history
  const history = dataModelService.getStoreChanges();
  console.log('Change history:', history.map(h => ({
    storeId: h.storeId,
    operation: h.operation,
    path: h.patchedPath,
    timestamp: new Date(h.timestamp).toISOString()
  })));
}

// Example 4: Apply patches (undo)
export function example4_ApplyPatches() {
  console.log('\n=== Example 4: Apply Patches (Undo) ===');

  dataModelService.registerDataModel('counter', { value: 0 });

  console.log('Initial:', dataModelService.getById('counter'));

  // Make changes
  dataModelService.setIn('counter', 'value', 10);
  console.log('After set to 10:', dataModelService.getById('counter'));

  dataModelService.setIn('counter', 'value', 20);
  console.log('After set to 20:', dataModelService.getById('counter'));

  // Get last patch
  const history = dataModelService.getStoreChanges();
  const lastPatch = history[history.length - 1];

  console.log('Last patch:', {
    patchId: lastPatch.patchId,
    previousValue: lastPatch.previousValue,
    patchedValue: lastPatch.patchedValue
  });

  // Undo last change
  dataModelService.applyPatch(lastPatch.patchId);
  console.log('After undo:', dataModelService.getById('counter'));
}

// Example 5: Session management
export function example5_SessionManagement() {
  console.log('\n=== Example 5: Session Management ===');

  // Register session
  dataModelService.registerDataModel('session', {});

  // Set session data
  dataModelService.setIn('session', 'userId', 'user-456');
  dataModelService.setIn('session', 'token', 'jwt-token-xyz');
  dataModelService.setIn('session', 'expiresAt', Date.now() + 3600000);
  dataModelService.setIn('session', ['user', 'email'], 'user@example.com');
  dataModelService.setIn('session', ['user', 'role'], 'admin');

  // Get session data
  const session = dataModelService.getById('session');
  console.log('Session data:', session);

  // Check session validity
  const expiresAt = dataModelService.getIn('session', 'expiresAt');
  const isValid = expiresAt > Date.now();
  console.log('Session is valid:', isValid);

  // Clear session
  dataModelService.deregisterDataModel('session');
  console.log('Session cleared');
}

// Example 6: Multiple data models
export function example6_MultipleModels() {
  console.log('\n=== Example 6: Multiple Models ===');

  // Register multiple models
  dataModelService.registerDataModel('cart', { items: [], total: 0 });
  dataModelService.registerDataModel('wishlist', { items: [] });
  dataModelService.registerDataModel('orders', { history: [] });

  // Populate data
  dataModelService.setIn('cart', 'items', [
    { id: 1, name: 'Product A', price: 10 },
    { id: 2, name: 'Product B', price: 20 }
  ]);
  dataModelService.setIn('cart', 'total', 30);

  dataModelService.setIn('wishlist', 'items', [
    { id: 3, name: 'Product C', price: 15 }
  ]);

  // List all registered models
  const allModels = dataModelService.getAllDataModelIds();
  console.log('Registered models:', allModels);

  // Display each model
  allModels.forEach(modelId => {
    console.log(`${modelId}:`, dataModelService.getById(modelId));
  });
}

// Example 7: Overwrite and mutable options
export function example7_OverwriteAndMutable() {
  console.log('\n=== Example 7: Overwrite and Mutable ===');

  // Register immutable (default)
  dataModelService.registerDataModel('immutable', { value: 100 });

  // Try to register again (will throw error)
  try {
    dataModelService.registerDataModel('immutable', { value: 200 });
  } catch (error: any) {
    console.log('Error (expected):', error.message);
  }

  // Register with overwrite flag
  dataModelService.registerDataModel('immutable', { value: 200 }, true);
  console.log('After overwrite:', dataModelService.getById('immutable'));

  // Register mutable (no deep clone)
  const mutableData = { nested: { value: 'original' } };
  dataModelService.registerDataModel('mutable', mutableData, false, true);

  // Modify original object
  mutableData.nested.value = 'modified';
  console.log('Mutable model (reflects change):', dataModelService.getById('mutable'));
}

// Run all examples
export function runAllExamples() {
  example1_UserDataModel();
  example2_ListenToChanges();
  example3_CheckAndHistory();
  example4_ApplyPatches();
  example5_SessionManagement();
  example6_MultipleModels();
  example7_OverwriteAndMutable();
}

// Uncomment to run examples
// runAllExamples();
