import React, { createContext, useContext, useReducer } from 'react';
import { AppState, AppAction } from './types';

const initialState: AppState = {
  pages: [{ id: crypto.randomUUID(), elements: [] }],
  activePageId: '',
  selectedElementIds: [],
  cropMode: false,
  showRuler: false,
  clipboardElements: [],
};
initialState.activePageId = initialState.pages[0].id;

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_RULER':
      return { ...state, showRuler: !state.showRuler };
    case 'ADD_PAGE':
      return { ...state, pages: [...state.pages, action.payload] };
    case 'DELETE_PAGE':
      return { ...state, pages: state.pages.filter(p => p.id !== action.payload) };
    case 'SET_ACTIVE_PAGE':
      return { ...state, activePageId: action.payload, selectedElementIds: [], cropMode: false };
    case 'ADD_ELEMENT':
      return {
        ...state,
        pages: state.pages.map(p =>
          p.id === action.payload.pageId
            ? { ...p, elements: [...p.elements, action.payload.element] }
            : p
        )
      };
    case 'UPDATE_ELEMENT':
      return {
        ...state,
        pages: state.pages.map(p => ({
          ...p,
          elements: p.elements.map(e => (e.id === action.payload.id ? { ...e, ...action.payload.updates } : e))
        }))
      };
    case 'DELETE_ELEMENT':
      return {
        ...state,
        pages: state.pages.map(p => ({
          ...p,
          elements: p.elements.filter(e => e.id !== action.payload.id)
        }))
      };
    case 'SET_SELECTED_ELEMENTS': {
      const activePage = state.pages.find(p => p.id === state.activePageId);
      if (!activePage) return state;

      // Group selection logic: if any selected item is in a group, select the whole group
      let finalSelection = new Set(action.payload);
      action.payload.forEach(id => {
        const el = activePage.elements.find(e => e.id === id);
        if (el?.groupId) {
          activePage.elements.filter(e => e.groupId === el.groupId).forEach(e => finalSelection.add(e.id));
        }
      });

      return { ...state, selectedElementIds: Array.from(finalSelection), cropMode: false };
    }
    case 'TOGGLE_SELECTED_ELEMENT': {
      const activePage = state.pages.find(p => p.id === state.activePageId);
      if (!activePage) return state;

      const el = activePage.elements.find(e => e.id === action.payload);
      if (!el) return state;

      let groupIds = new Set([el.id]);
      if (el.groupId) {
        activePage.elements.filter(e => e.groupId === el.groupId).forEach(e => groupIds.add(e.id));
      }

      const isSelected = state.selectedElementIds.includes(el.id);
      let newSelection = new Set(state.selectedElementIds);
      
      groupIds.forEach(id => {
        if (isSelected) {
          newSelection.delete(id);
        } else {
          newSelection.add(id);
        }
      });

      return { ...state, selectedElementIds: Array.from(newSelection), cropMode: false };
    }
    case 'GROUP_ELEMENTS': {
      if (state.selectedElementIds.length < 2) return state;
      const groupId = Math.random().toString(36).substr(2, 9);
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          return {
            ...p,
            elements: p.elements.map(e => state.selectedElementIds.includes(e.id) ? { ...e, groupId } : e)
          };
        })
      };
    }
    case 'UNGROUP_ELEMENTS': {
      if (state.selectedElementIds.length === 0) return state;
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          return {
            ...p,
            elements: p.elements.map(e => state.selectedElementIds.includes(e.id) ? { ...e, groupId: undefined } : e)
          };
        })
      };
    }
    case 'BRING_TO_FRONT': {
      if (state.selectedElementIds.length === 0) return state;
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          const selected = p.elements.filter(e => state.selectedElementIds.includes(e.id));
          const unselected = p.elements.filter(e => !state.selectedElementIds.includes(e.id));
          return { ...p, elements: [...unselected, ...selected] };
        })
      };
    }
    case 'SEND_TO_BACK': {
      if (state.selectedElementIds.length === 0) return state;
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          const selected = p.elements.filter(e => state.selectedElementIds.includes(e.id));
          const unselected = p.elements.filter(e => !state.selectedElementIds.includes(e.id));
          return { ...p, elements: [...selected, ...unselected] };
        })
      };
    }
    case 'MOVE_UP': {
      if (state.selectedElementIds.length === 0) return state;
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          // Strategy: Move each selected item up by 1 index, starting from the end
          let newElements = [...p.elements];
          for (let i = newElements.length - 2; i >= 0; i--) {
            if (state.selectedElementIds.includes(newElements[i].id) && !state.selectedElementIds.includes(newElements[i+1].id)) {
              // Swap
              [newElements[i], newElements[i+1]] = [newElements[i+1], newElements[i]];
            }
          }
          return { ...p, elements: newElements };
        })
      };
    }
    case 'MOVE_DOWN': {
      if (state.selectedElementIds.length === 0) return state;
      return {
        ...state,
        pages: state.pages.map(p => {
          if (p.id !== state.activePageId) return p;
          // Strategy: Move each selected item down by 1 index, starting from index 1
          let newElements = [...p.elements];
          for (let i = 1; i < newElements.length; i++) {
            if (state.selectedElementIds.includes(newElements[i].id) && !state.selectedElementIds.includes(newElements[i-1].id)) {
              // Swap
              [newElements[i], newElements[i-1]] = [newElements[i-1], newElements[i]];
            }
          }
          return { ...p, elements: newElements };
        })
      };
    }
    case 'SET_CROP_MODE':
      return { ...state, cropMode: action.payload };
    case 'COPY_ELEMENT': {
      const activePageForCopy = state.pages.find(p => p.id === state.activePageId);
      if (!activePageForCopy || state.selectedElementIds.length === 0) return state;
      const elementsToCopy = activePageForCopy.elements.filter(e => state.selectedElementIds.includes(e.id));
      return { ...state, clipboardElements: elementsToCopy };
    }
    case 'PASTE_ELEMENT': {
      if (!state.clipboardElements || state.clipboardElements.length === 0) return state;
      
      const newGroupId = state.clipboardElements.length > 1 && state.clipboardElements[0].groupId 
        ? Math.random().toString(36).substr(2, 9) 
        : undefined;

      const newElements = state.clipboardElements.map(el => ({
        ...el,
        id: Math.random().toString(36).substr(2, 9),
        groupId: el.groupId ? newGroupId : undefined,
        x: el.x + 1, // Offset by 1 cm
        y: el.y + 1 
      }));

      return {
        ...state,
        pages: state.pages.map(p => 
          p.id === state.activePageId 
            ? { ...p, elements: [...p.elements, ...newElements] }
            : p
        ),
        selectedElementIds: newElements.map(e => e.id)
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction> } | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
