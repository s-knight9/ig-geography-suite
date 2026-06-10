export const PIXELS_PER_CM = 40;

export type ElementData = {
  id: string;
  src: string;
  x: number; // cm
  y: number; // cm
  width: number; // cm
  height: number; // cm
  rotation: number;
  nativeWidth: number; // px
  nativeHeight: number; // px
  dpi: number;
  crop?: { t: number, r: number, b: number, l: number }; // cm
  groupId?: string;
};

export type PageData = {
  id: string;
  elements: ElementData[];
};

export type AppState = {
  pages: PageData[];
  activePageId: string;
  selectedElementIds: string[];
  cropMode: boolean;
  showRuler: boolean;
  clipboardElements: ElementData[];
};

export type AppAction =
  | { type: 'ADD_PAGE'; payload: PageData }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'SET_ACTIVE_PAGE'; payload: string }
  | { type: 'ADD_ELEMENT'; payload: { pageId: string; element: ElementData } }
  | { type: 'UPDATE_ELEMENT'; payload: { id: string; updates: Partial<ElementData> } }
  | { type: 'DELETE_ELEMENT'; payload: { id: string } }
  | { type: 'SET_SELECTED_ELEMENTS'; payload: string[] }
  | { type: 'TOGGLE_SELECTED_ELEMENT'; payload: string }
  | { type: 'GROUP_ELEMENTS' }
  | { type: 'UNGROUP_ELEMENTS' }
  | { type: 'BRING_TO_FRONT' }
  | { type: 'SEND_TO_BACK' }
  | { type: 'MOVE_UP' }
  | { type: 'MOVE_DOWN' }
  | { type: 'SET_CROP_MODE'; payload: boolean }
  | { type: 'TOGGLE_RULER' }
  | { type: 'COPY_ELEMENT' }
  | { type: 'PASTE_ELEMENT' };
