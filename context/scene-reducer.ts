import { SceneState, SceneAction } from '@/types/scene';
import { randomUUID } from 'crypto';

export const initialState: SceneState = {
  currentKeyframe: 0,
  objects: [],
  selectedIds: [],
  envelopeVisibility: {
    forkliftVision: true,
    mafiSwing: true,
    spotterLOS: true,
    rampClearance: true
  },
  changeHistory: [],
  timeline: {
    keyframes: [{
      id: 'T0',
      timestamp: 0,
      label: 'Initial State',
      objectStates: {}
    }],
    duration: 0,
    fps: 30
  },
  undoStack: [],
  redoStack: []
};

// Helper to create snapshot of current state
function createSnapshot(state: SceneState) {
  return {
    objects: state.objects,
    selectedIds: state.selectedIds,
    currentKeyframe: state.currentKeyframe,
    envelopeVisibility: state.envelopeVisibility
  };
}

// Helper to restore snapshot
function restoreSnapshot(state: SceneState, snapshot: any): SceneState {
  return {
    ...state,
    objects: snapshot.objects,
    selectedIds: snapshot.selectedIds,
    currentKeyframe: snapshot.currentKeyframe,
    envelopeVisibility: snapshot.envelopeVisibility
  };
}

export function sceneReducer(state: SceneState, action: SceneAction): SceneState {
  // Handle UNDO/REDO separately (don't save to undo stack)
  if (action.type === 'UNDO') {
    if (state.undoStack.length === 0) {
      return state;
    }

    const previousSnapshot = state.undoStack[state.undoStack.length - 1];
    const newUndoStack = state.undoStack.slice(0, -1);
    const currentSnapshot = createSnapshot(state);

    return {
      ...restoreSnapshot(state, previousSnapshot),
      changeHistory: state.changeHistory,
      timeline: state.timeline,
      undoStack: newUndoStack,
      redoStack: [...state.redoStack, currentSnapshot]
    };
  }

  if (action.type === 'REDO') {
    if (state.redoStack.length === 0) {
      return state;
    }

    const nextSnapshot = state.redoStack[state.redoStack.length - 1];
    const newRedoStack = state.redoStack.slice(0, -1);
    const currentSnapshot = createSnapshot(state);

    return {
      ...restoreSnapshot(state, nextSnapshot),
      changeHistory: state.changeHistory,
      timeline: state.timeline,
      undoStack: [...state.undoStack, currentSnapshot],
      redoStack: newRedoStack
    };
  }

  // For all other actions, save current state to undo stack and clear redo stack
  const snapshot = createSnapshot(state);

  switch (action.type) {
    case 'ADD_OBJECT':
      return {
        ...state,
        objects: [...state.objects, action.payload],
        changeHistory: [
          ...state.changeHistory,
          {
            id: randomUUID(),
            action: 'ADD_OBJECT',
            timestamp: Date.now(),
            oldValue: null,
            newValue: action.payload
          }
        ],
        undoStack: [...state.undoStack, snapshot],
        redoStack: [] // Clear redo stack on new action
      };

    case 'MOVE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj =>
          obj.id === action.payload.id
            ? { ...obj, properties: { ...obj.properties, position: action.payload.position } }
            : obj
        ),
        changeHistory: [
          ...state.changeHistory,
          {
            id: randomUUID(),
            action: 'MOVE_OBJECT',
            timestamp: Date.now(),
            oldValue: state.objects.find(o => o.id === action.payload.id),
            newValue: action.payload
          }
        ],
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'ROTATE_OBJECT':
      return {
        ...state,
        objects: state.objects.map(obj =>
          obj.id === action.payload.id
            ? { ...obj, properties: { ...obj.properties, rotation: action.payload.rotation } }
            : obj
        ),
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'DELETE_OBJECT':
      return {
        ...state,
        objects: state.objects.filter(obj => obj.id !== action.payload.id),
        selectedIds: state.selectedIds.filter(id => id !== action.payload.id),
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'SET_KEYFRAME':
      return {
        ...state,
        currentKeyframe: action.payload,
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'TOGGLE_ENVELOPE':
      return {
        ...state,
        envelopeVisibility: {
          ...state.envelopeVisibility,
          [action.payload]: !state.envelopeVisibility[action.payload]
        },
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'SELECT_OBJECT':
      return {
        ...state,
        selectedIds: [...state.selectedIds, action.payload.id],
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'DESELECT_OBJECT':
      return {
        ...state,
        selectedIds: state.selectedIds.filter(id => id !== action.payload.id),
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedIds: [],
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'ADD_KEYFRAME':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          keyframes: [...state.timeline.keyframes, action.payload].sort((a, b) => a.timestamp - b.timestamp),
          duration: Math.max(state.timeline.duration, action.payload.timestamp)
        },
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'UPDATE_KEYFRAME':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          keyframes: state.timeline.keyframes.map(kf =>
            kf.id === action.payload.id
              ? { ...kf, ...action.payload.updates }
              : kf
          )
        },
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'DELETE_KEYFRAME':
      const filteredKeyframes = state.timeline.keyframes.filter(kf => kf.id !== action.payload.id);
      return {
        ...state,
        timeline: {
          ...state.timeline,
          keyframes: filteredKeyframes,
          duration: filteredKeyframes.length > 0
            ? filteredKeyframes[filteredKeyframes.length - 1].timestamp
            : 0
        },
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'UPDATE_OBJECT_AT_KEYFRAME':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          keyframes: state.timeline.keyframes.map(kf =>
            kf.id === action.payload.keyframeId
              ? {
                  ...kf,
                  objectStates: {
                    ...kf.objectStates,
                    [action.payload.objectId]: action.payload.state
                  }
                }
              : kf
          )
        },
        undoStack: [...state.undoStack, snapshot],
        redoStack: []
      };

    case 'SET_TIME':
      return {
        ...state,
        currentKeyframe: action.payload
      };

    case 'APPLY_INTERPOLATED_STATES':
      // Apply interpolated states to objects
      return {
        ...state,
        objects: state.objects.map(obj => {
          const interpolatedState = action.payload[obj.id];
          if (interpolatedState) {
            return {
              ...obj,
              properties: {
                ...obj.properties,
                position: interpolatedState.position,
                rotation: interpolatedState.rotation,
                ...interpolatedState.properties
              }
            };
          }
          return obj;
        })
      };

    default:
      return state;
  }
}
