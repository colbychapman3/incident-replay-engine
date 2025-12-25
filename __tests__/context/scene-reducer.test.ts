import { sceneReducer, initialState } from '@/context/scene-reducer';
import { SceneState, SceneAction, SceneObject } from '@/types/scene';

describe('sceneReducer', () => {
  describe('ADD_OBJECT', () => {
    it('should add object to state', () => {
      const newObject: SceneObject = {
        id: 'obj-1',
        assetId: 'forklift-v1',
        type: 'vehicle',
        locked: false,
        properties: { position: { x: 10, y: 20 }, rotation: 0 }
      };

      const action: SceneAction = {
        type: 'ADD_OBJECT',
        payload: newObject
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.objects).toHaveLength(1);
      expect(newState.objects[0]).toEqual(newObject);
    });

    it('should create change history entry', () => {
      const newObject: SceneObject = {
        id: 'obj-1',
        assetId: 'forklift-v1',
        type: 'vehicle',
        locked: false,
        properties: {}
      };

      const action: SceneAction = {
        type: 'ADD_OBJECT',
        payload: newObject
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.changeHistory).toHaveLength(1);
      expect(newState.changeHistory[0].action).toBe('ADD_OBJECT');
      expect(newState.changeHistory[0].newValue).toEqual(newObject);
      expect(newState.changeHistory[0].oldValue).toBeNull();
    });
  });

  describe('MOVE_OBJECT', () => {
    it('should update object position', () => {
      const stateWithObject: SceneState = {
        ...initialState,
        objects: [{
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: { position: { x: 0, y: 0 }, rotation: 0 }
        }]
      };

      const action: SceneAction = {
        type: 'MOVE_OBJECT',
        payload: { id: 'obj-1', position: { x: 15, y: 25 } }
      };

      const newState = sceneReducer(stateWithObject, action);

      expect(newState.objects[0].properties.position).toEqual({ x: 15, y: 25 });
    });

    it('should not modify other objects', () => {
      const stateWithObjects: SceneState = {
        ...initialState,
        objects: [
          {
            id: 'obj-1',
            assetId: 'forklift-v1',
            type: 'vehicle',
            locked: false,
            properties: { position: { x: 0, y: 0 } }
          },
          {
            id: 'obj-2',
            assetId: 'mafi-truck-v1',
            type: 'vehicle',
            locked: false,
            properties: { position: { x: 10, y: 10 } }
          }
        ]
      };

      const action: SceneAction = {
        type: 'MOVE_OBJECT',
        payload: { id: 'obj-1', position: { x: 5, y: 5 } }
      };

      const newState = sceneReducer(stateWithObjects, action);

      expect(newState.objects[1].properties.position).toEqual({ x: 10, y: 10 });
    });
  });

  describe('ROTATE_OBJECT', () => {
    it('should update object rotation', () => {
      const stateWithObject: SceneState = {
        ...initialState,
        objects: [{
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: { rotation: 0 }
        }]
      };

      const action: SceneAction = {
        type: 'ROTATE_OBJECT',
        payload: { id: 'obj-1', rotation: 45 }
      };

      const newState = sceneReducer(stateWithObject, action);

      expect(newState.objects[0].properties.rotation).toBe(45);
    });

    it('should handle 360-degree rotation', () => {
      const stateWithObject: SceneState = {
        ...initialState,
        objects: [{
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: { rotation: 0 }
        }]
      };

      const action: SceneAction = {
        type: 'ROTATE_OBJECT',
        payload: { id: 'obj-1', rotation: 360 }
      };

      const newState = sceneReducer(stateWithObject, action);

      expect(newState.objects[0].properties.rotation).toBe(360);
    });
  });

  describe('DELETE_OBJECT', () => {
    it('should remove object from state', () => {
      const stateWithObject: SceneState = {
        ...initialState,
        objects: [{
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }]
      };

      const action: SceneAction = {
        type: 'DELETE_OBJECT',
        payload: { id: 'obj-1' }
      };

      const newState = sceneReducer(stateWithObject, action);

      expect(newState.objects).toHaveLength(0);
    });

    it('should remove from selectedIds if selected', () => {
      const stateWithObject: SceneState = {
        ...initialState,
        objects: [{
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }],
        selectedIds: ['obj-1']
      };

      const action: SceneAction = {
        type: 'DELETE_OBJECT',
        payload: { id: 'obj-1' }
      };

      const newState = sceneReducer(stateWithObject, action);

      expect(newState.selectedIds).toHaveLength(0);
    });
  });

  describe('SET_KEYFRAME', () => {
    it('should update current keyframe', () => {
      const action: SceneAction = {
        type: 'SET_KEYFRAME',
        payload: 2
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.currentKeyframe).toBe(2);
    });
  });

  describe('TOGGLE_ENVELOPE', () => {
    it('should toggle forklift vision envelope', () => {
      const action: SceneAction = {
        type: 'TOGGLE_ENVELOPE',
        payload: 'forkliftVision'
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.envelopeVisibility.forkliftVision).toBe(false);
    });

    it('should toggle mafi swing envelope', () => {
      const action: SceneAction = {
        type: 'TOGGLE_ENVELOPE',
        payload: 'mafiSwing'
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.envelopeVisibility.mafiSwing).toBe(false);
    });

    it('should not affect other envelope visibility', () => {
      const action: SceneAction = {
        type: 'TOGGLE_ENVELOPE',
        payload: 'forkliftVision'
      };

      const newState = sceneReducer(initialState, action);

      expect(newState.envelopeVisibility.mafiSwing).toBe(true);
      expect(newState.envelopeVisibility.spotterLOS).toBe(true);
      expect(newState.envelopeVisibility.rampClearance).toBe(true);
    });
  });

  describe('UNDO', () => {
    it('should revert to previous state', () => {
      // Add object
      const addAction: SceneAction = {
        type: 'ADD_OBJECT',
        payload: {
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }
      };

      const stateAfterAdd = sceneReducer(initialState, addAction);
      expect(stateAfterAdd.objects).toHaveLength(1);

      // Undo
      const undoAction: SceneAction = { type: 'UNDO' };
      const stateAfterUndo = sceneReducer(stateAfterAdd, undoAction);

      expect(stateAfterUndo.objects).toHaveLength(0);
    });

    it('should handle multiple undos', () => {
      let state = initialState;

      // Add 3 objects
      for (let i = 1; i <= 3; i++) {
        const action: SceneAction = {
          type: 'ADD_OBJECT',
          payload: {
            id: `obj-${i}`,
            assetId: 'forklift-v1',
            type: 'vehicle',
            locked: false,
            properties: {}
          }
        };
        state = sceneReducer(state, action);
      }

      expect(state.objects).toHaveLength(3);

      // Undo twice
      state = sceneReducer(state, { type: 'UNDO' });
      state = sceneReducer(state, { type: 'UNDO' });

      expect(state.objects).toHaveLength(1);
    });

    it('should not undo beyond initial state', () => {
      const undoAction: SceneAction = { type: 'UNDO' };
      const newState = sceneReducer(initialState, undoAction);

      expect(newState).toEqual(initialState);
    });
  });

  describe('REDO', () => {
    it('should redo undone action', () => {
      // Add object
      const addAction: SceneAction = {
        type: 'ADD_OBJECT',
        payload: {
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }
      };

      let state = sceneReducer(initialState, addAction);
      expect(state.objects).toHaveLength(1);

      // Undo
      state = sceneReducer(state, { type: 'UNDO' });
      expect(state.objects).toHaveLength(0);

      // Redo
      state = sceneReducer(state, { type: 'REDO' });
      expect(state.objects).toHaveLength(1);
      expect(state.objects[0].id).toBe('obj-1');
    });

    it('should not redo if no undo was performed', () => {
      const redoAction: SceneAction = { type: 'REDO' };
      const newState = sceneReducer(initialState, redoAction);

      expect(newState).toEqual(initialState);
    });

    it('should clear redo stack when new action is performed', () => {
      // Add object
      const addAction1: SceneAction = {
        type: 'ADD_OBJECT',
        payload: {
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }
      };

      let state = sceneReducer(initialState, addAction1);

      // Undo
      state = sceneReducer(state, { type: 'UNDO' });

      // Add different object (should clear redo stack)
      const addAction2: SceneAction = {
        type: 'ADD_OBJECT',
        payload: {
          id: 'obj-2',
          assetId: 'mafi-truck-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }
      };
      state = sceneReducer(state, addAction2);

      // Try to redo (should not bring back obj-1)
      state = sceneReducer(state, { type: 'REDO' });

      expect(state.objects).toHaveLength(1);
      expect(state.objects[0].id).toBe('obj-2');
    });
  });

  describe('immutability', () => {
    it('should not mutate original state', () => {
      const originalState = { ...initialState };
      const action: SceneAction = {
        type: 'ADD_OBJECT',
        payload: {
          id: 'obj-1',
          assetId: 'forklift-v1',
          type: 'vehicle',
          locked: false,
          properties: {}
        }
      };

      sceneReducer(initialState, action);

      expect(initialState).toEqual(originalState);
    });
  });
});
