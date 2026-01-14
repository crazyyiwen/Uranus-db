export type Segments = string | string[];

export enum StoreAction {
  register = 'register',
  edit = 'edit',
  delete = 'delete'
}

export interface IStorePatch {
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

export interface IStoreChange {
  store: Map<string, any> | undefined;
  patch: IStorePatch;
}

export type StoreChangeListener = (change: IStoreChange) => void;
