import { EventEmitter } from 'events';
import * as _ from 'lodash';
import { generateUid } from '../../utils/generators';
import {
  Segments,
  IStoreChange,
  IStorePatch,
  StoreAction,
  StoreChangeListener
} from '../../types/store.types';

/**
 * Data Model Manager Service
 * Manages global data models with immutability, change tracking, and event notifications
 */
export class DataModelService extends EventEmitter {
  private static instance: DataModelService;
  private dataModels: Map<string, any>;
  private storeChanges: IStorePatch[] = [];

  private constructor() {
    super();
    this.dataModels = new Map<string, any>();
  }

  /**
   * Get singleton instance of DataModelService
   */
  public static getInstance(): DataModelService {
    if (!DataModelService.instance) {
      DataModelService.instance = new DataModelService();
    }
    return DataModelService.instance;
  }

  //#region => Data Models Registration

  /**
   * Register a new data model
   * @param dataModelId - Unique identifier for the data model
   * @param dataModel - The data model to register
   * @param overwrite - Whether to overwrite existing model with same ID
   * @param isMutable - Whether to store the model as mutable (no deep clone)
   */
  public registerDataModel(
    dataModelId: string,
    dataModel: any,
    overwrite: boolean = false,
    isMutable: boolean = false
  ): void {
    if (!dataModelId) {
      throw new Error(`Data Models Manager Error: Invalid data model ID!`);
    }
    if (dataModel === undefined) {
      throw new Error(`Data Models Manager Error: Invalid data model!`);
    }
    if (this.dataModels.has(dataModelId) && !overwrite) {
      throw new Error(
        `Data Models Manager Error: Invalid data model ID! Data Model with the same ID already registered '${dataModelId}'. If you intend to overwrite existing data model, please register data model with overwrite flag set to true.`
      );
    }

    this.dataModels.set(
      dataModelId,
      isMutable ? dataModel : _.cloneDeep(dataModel)
    );

    this.notifyChanges({
      store: this.dataModels,
      patch: {
        patchId: generateUid(),
        storeId: dataModelId,
        firstChange: true,
        timestamp: Date.now(),
        operation: StoreAction.register,
        innerAction: false
      }
    });
  }

  /**
   * Deregister a data model
   * @param dataModelId - Data model identifier
   */
  public deregisterDataModel(dataModelId: string): void {
    if (!dataModelId) {
      throw new Error(`Data Models Manager Error: Invalid data model ID!`);
    }

    this.dataModels.delete(dataModelId);

    // Remove all patches related to this data model
    this.storeChanges = this.storeChanges.filter(
      (patch) => patch.storeId !== dataModelId
    );

    this.notifyChanges({
      store: this.dataModels,
      patch: {
        patchId: generateUid(),
        storeId: dataModelId,
        firstChange: false,
        timestamp: Date.now(),
        operation: StoreAction.delete,
        innerAction: false
      }
    });
  }

  //#endregion

  //#region => Accessors

  /**
   * Check if a data model exists
   * @param dataModelId - Data model identifier
   */
  public has(dataModelId: string): boolean {
    return this.dataModels.has(dataModelId);
  }

  /**
   * Check if a path exists within a data model
   * @param dataModelId - Data model identifier
   * @param path - Path to check (dot notation or array)
   */
  public hasIn(dataModelId: string, path: Segments): boolean {
    if (this.dataModels.has(dataModelId)) {
      return _.has(this.dataModels.get(dataModelId), path);
    }
    return false;
  }

  /**
   * Get entire data model by id
   * @param dataModelId - Data model identifier
   */
  public getById(dataModelId: string): any {
    return this.dataModels.get(dataModelId);
  }

  /**
   * Get data at a specific path within a data model
   * @param dataModelId - Data model identifier
   * @param path - Path to the data (dot notation string or array of keys)
   */
  public getIn(dataModelId: string, path: Segments): any {
    return _.get(this.dataModels.get(dataModelId), path);
  }

  /**
   * Set data at a specific path within a data model
   * @param dataModelId - Data model identifier
   * @param path - Path to the data (dot notation string or array of keys)
   * @param value - Value to set
   */
  public setIn(dataModelId: string, path: Segments, value: any): void {
    const shouldImmute = this.shouldImmute(dataModelId, path, value);
    if (shouldImmute === undefined) return;

    this.notifyChanges({
      store: this.dataModels.set(
        dataModelId,
        _.setWith(this.immuteRoot(dataModelId), path, value, this.setWithCustomizer)
      ),
      patch: {
        patchId: generateUid(),
        storeId: dataModelId,
        firstChange: false,
        timestamp: Date.now(),
        patchedPath: Array.isArray(path) ? path.join('.') : path,
        patchedSegments: Array.isArray(path) ? path : path.split('.'),
        patchedValue: value,
        previousValue: shouldImmute,
        operation: StoreAction.edit,
        innerAction: false
      }
    });
  }

  /**
   * Extend data at a specific path within a data model
   * @param dataModelId - Data model identifier
   * @param path - Path to the data
   * @param value - Value to extend with
   * @param overwrite - Whether to overwrite existing value
   */
  public extend(
    dataModelId: string,
    path: string[],
    value: any,
    overwrite: boolean = false
  ): void {
    const existingValue = this.getIn(dataModelId, path);

    this.notifyChanges({
      store: this.dataModels.set(
        dataModelId,
        _.setWith(this.immuteRoot(dataModelId), path, value, this.setWithCustomizer)
      ),
      patch: {
        patchId: generateUid(),
        storeId: dataModelId,
        firstChange: false,
        timestamp: Date.now(),
        patchedPath: path.join('.'),
        patchedSegments: path,
        patchedValue: value,
        previousValue: existingValue,
        operation: StoreAction.edit,
        innerAction: false
      }
    });
  }

  /**
   * Apply a patch by ID (undo functionality)
   * @param patchId - Patch identifier
   */
  public applyPatch(patchId: string): void {
    const patch = this.storeChanges.find((p) => p.patchId === patchId);
    if (!patch) {
      throw new Error(
        `Data Models Manager Error: Could not locate a config patch for the given Id: '${patchId}'`
      );
    }
    if (patch.patchedSegments) {
      this.setIn(patch.storeId, patch.patchedSegments, patch.previousValue);
    }
  }

  /**
   * Get all store changes (history)
   */
  public getStoreChanges(): IStorePatch[] {
    return this.storeChanges;
  }

  /**
   * Get all registered data model IDs
   */
  public getAllDataModelIds(): string[] {
    return Array.from(this.dataModels.keys());
  }

  /**
   * Clear all data models
   */
  public clearAll(): void {
    this.dataModels.clear();
    this.storeChanges = [];
    console.log('All data models cleared.');
  }

  //#endregion

  //#region => Private Methods

  /**
   * Create immutable copy of root data model
   */
  private immuteRoot(dataModelId: string): any {
    return _.clone(this.getById(dataModelId));
  }

  /**
   * Customizer for setWith to ensure immutability
   */
  private setWithCustomizer = (value: any): any => {
    return _.clone(value);
  };

  /**
   * Check if immutation is needed and return previous value
   */
  private shouldImmute(storeId: string, path: Segments, newValue: any): any {
    const currentValue = this.getIn(storeId, path);
    if (typeof newValue === 'object' || Array.isArray(newValue)) {
      return _.cloneDeep(currentValue);
    }
    return currentValue !== newValue ? _.cloneDeep(currentValue) : undefined;
  }

  /**
   * Notify all listeners about changes
   */
  private notifyChanges(change: IStoreChange): void {
    this.emit('storeChange', change);
    if (!change.patch.firstChange) {
      this.storeChanges.push(change.patch);
    }
    // Uncomment for debugging
    // console.log('Data Models Manager Change ->', change, this.storeChanges);
  }

  //#endregion

  //#region => Event Listeners

  /**
   * Subscribe to store changes
   * @param listener - Callback function for store changes
   */
  public onStoreChange(listener: StoreChangeListener): void {
    this.on('storeChange', listener);
  }

  /**
   * Unsubscribe from store changes
   * @param listener - Callback function to remove
   */
  public offStoreChange(listener: StoreChangeListener): void {
    this.off('storeChange', listener);
  }

  //#endregion
}

// Export singleton instance
export default DataModelService.getInstance();
