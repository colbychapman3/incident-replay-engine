'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';

/**
 * 8-Step Project Wizard for Incident Replay Engine
 * Court-safe incident documentation with validation at each step
 */

export interface ProjectWizardData {
  // Step 1: Project Info
  projectName: string;
  description: string;

  // Step 2: Incident Details
  incidentDate: string;
  incidentTime: string;
  location: string;

  // Step 3: Scene Type
  sceneType: 'vessel-deck' | 'port-road';

  // Step 4: Scene Dimensions
  sceneWidth: number; // meters
  sceneHeight: number; // meters

  // Step 5: Participants
  participants: Array<{
    role: string;
    name: string;
    ppe?: string;
  }>;

  // Step 6: Vehicles/Equipment
  vehicles: Array<{
    type: string;
    id: string;
  }>;

  // Step 7: Initial Keyframe
  initialDescription: string;

  // Step 8: Review & Confirm
  confirmed: boolean;
}

const initialData: ProjectWizardData = {
  projectName: '',
  description: '',
  incidentDate: '',
  incidentTime: '',
  location: '',
  sceneType: 'vessel-deck',
  sceneWidth: 100,
  sceneHeight: 60,
  participants: [],
  vehicles: [],
  initialDescription: '',
  confirmed: false
};

export interface ProjectWizardProps {
  onComplete: (data: ProjectWizardData) => void;
  onCancel: () => void;
}

export function ProjectWizard({ onComplete, onCancel }: ProjectWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ProjectWizardData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 8;

  /**
   * Validate current step
   */
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!data.projectName.trim()) {
          newErrors.projectName = 'Project name is required';
        }
        if (!data.description.trim()) {
          newErrors.description = 'Description is required';
        }
        break;

      case 2:
        if (!data.incidentDate) {
          newErrors.incidentDate = 'Incident date is required';
        }
        if (!data.incidentTime) {
          newErrors.incidentTime = 'Incident time is required';
        }
        if (!data.location.trim()) {
          newErrors.location = 'Location is required';
        }
        break;

      case 3:
        if (!data.sceneType) {
          newErrors.sceneType = 'Scene type is required';
        }
        break;

      case 4:
        if (data.sceneWidth <= 0) {
          newErrors.sceneWidth = 'Width must be greater than 0';
        }
        if (data.sceneHeight <= 0) {
          newErrors.sceneHeight = 'Height must be greater than 0';
        }
        break;

      case 5:
        if (data.participants.length === 0) {
          newErrors.participants = 'At least one participant is required';
        }
        break;

      case 6:
        // Vehicles optional
        break;

      case 7:
        if (!data.initialDescription.trim()) {
          newErrors.initialDescription = 'Initial state description is required';
        }
        break;

      case 8:
        if (!data.confirmed) {
          newErrors.confirmed = 'Please confirm the information is correct';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === totalSteps) {
        onComplete(data);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const updateData = (field: keyof ProjectWizardData, value: any) => {
    setData({ ...data, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const addParticipant = () => {
    updateData('participants', [...data.participants, { role: '', name: '' }]);
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...data.participants];
    updated[index] = { ...updated[index], [field]: value };
    updateData('participants', updated);
  };

  const removeParticipant = (index: number) => {
    updateData('participants', data.participants.filter((_, i) => i !== index));
  };

  const addVehicle = () => {
    updateData('vehicles', [...data.vehicles, { type: '', id: '' }]);
  };

  const updateVehicle = (index: number, field: string, value: string) => {
    const updated = [...data.vehicles];
    updated[index] = { ...updated[index], [field]: value };
    updateData('vehicles', updated);
  };

  const removeVehicle = (index: number) => {
    updateData('vehicles', data.vehicles.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">New Incident Project</h2>
          <p className="text-sm text-gray-400 mt-1">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress bar */}
        <div className="bg-gray-800 px-6 py-2">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded ${
                  i + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 1 && (
            <StepProjectInfo data={data} updateData={updateData} errors={errors} />
          )}
          {currentStep === 2 && (
            <StepIncidentDetails data={data} updateData={updateData} errors={errors} />
          )}
          {currentStep === 3 && (
            <StepSceneType data={data} updateData={updateData} errors={errors} />
          )}
          {currentStep === 4 && (
            <StepDimensions data={data} updateData={updateData} errors={errors} />
          )}
          {currentStep === 5 && (
            <StepParticipants
              data={data}
              errors={errors}
              addParticipant={addParticipant}
              updateParticipant={updateParticipant}
              removeParticipant={removeParticipant}
            />
          )}
          {currentStep === 6 && (
            <StepVehicles
              data={data}
              addVehicle={addVehicle}
              updateVehicle={updateVehicle}
              removeVehicle={removeVehicle}
            />
          )}
          {currentStep === 7 && (
            <StepInitialState data={data} updateData={updateData} errors={errors} />
          )}
          {currentStep === 8 && (
            <StepReview data={data} updateData={updateData} errors={errors} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
            >
              {currentStep === totalSteps ? (
                <>
                  <Check className="w-4 h-4" />
                  Create Project
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Project Info
function StepProjectInfo({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Project Information</h3>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Project Name *
        </label>
        <input
          type="text"
          value={data.projectName}
          onChange={(e) => updateData('projectName', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          placeholder="e.g., Forklift Incident - Dec 28 2024"
        />
        {errors.projectName && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.projectName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateData('description', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          placeholder="Brief description of the incident..."
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Step 2: Incident Details
function StepIncidentDetails({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Incident Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Date *
          </label>
          <input
            type="date"
            value={data.incidentDate}
            onChange={(e) => updateData('incidentDate', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
          {errors.incidentDate && (
            <p className="text-red-400 text-sm mt-1">{errors.incidentDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Time *
          </label>
          <input
            type="time"
            value={data.incidentTime}
            onChange={(e) => updateData('incidentTime', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
          {errors.incidentTime && (
            <p className="text-red-400 text-sm mt-1">{errors.incidentTime}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Location *
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => updateData('location', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          placeholder="e.g., Port of Oakland, Berth 25"
        />
        {errors.location && (
          <p className="text-red-400 text-sm mt-1">{errors.location}</p>
        )}
      </div>
    </div>
  );
}

// Step 3: Scene Type
function StepSceneType({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Scene Type</h3>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => updateData('sceneType', 'vessel-deck')}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.sceneType === 'vessel-deck'
              ? 'border-blue-500 bg-blue-900 bg-opacity-20'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <h4 className="text-white font-semibold mb-2">Vessel Deck</h4>
          <p className="text-sm text-gray-400">
            Shipboard operations, ramp operations, crane work
          </p>
        </button>

        <button
          onClick={() => updateData('sceneType', 'port-road')}
          className={`p-6 border-2 rounded-lg transition-all ${
            data.sceneType === 'port-road'
              ? 'border-blue-500 bg-blue-900 bg-opacity-20'
              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
          }`}
        >
          <h4 className="text-white font-semibold mb-2">Port Road</h4>
          <p className="text-sm text-gray-400">
            Ground-level operations, truck movements, loading zones
          </p>
        </button>
      </div>
    </div>
  );
}

// Step 4: Dimensions
function StepDimensions({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Scene Dimensions</h3>
      <p className="text-sm text-gray-400">
        Define the operational area in meters (maritime standard)
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Width (meters) *
          </label>
          <input
            type="number"
            value={data.sceneWidth}
            onChange={(e) => updateData('sceneWidth', parseFloat(e.target.value))}
            min="1"
            step="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
          {errors.sceneWidth && (
            <p className="text-red-400 text-sm mt-1">{errors.sceneWidth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Height (meters) *
          </label>
          <input
            type="number"
            value={data.sceneHeight}
            onChange={(e) => updateData('sceneHeight', parseFloat(e.target.value))}
            min="1"
            step="1"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          />
          {errors.sceneHeight && (
            <p className="text-red-400 text-sm mt-1">{errors.sceneHeight}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded border border-gray-700">
        <p className="text-sm text-gray-300">
          <strong>Preview:</strong> {data.sceneWidth}m × {data.sceneHeight}m operational area
        </p>
      </div>
    </div>
  );
}

// Step 5: Participants
function StepParticipants({ data, errors, addParticipant, updateParticipant, removeParticipant }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Participants</h3>

      {data.participants.map((p: any, i: number) => (
        <div key={i} className="bg-gray-800 p-4 rounded border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-medium">Participant {i + 1}</h4>
            <button
              onClick={() => removeParticipant(i)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Role</label>
              <input
                type="text"
                value={p.role}
                onChange={(e) => updateParticipant(i, 'role', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                placeholder="e.g., Driver, Spotter"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                placeholder="e.g., John Doe"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addParticipant}
        className="w-full py-3 border-2 border-dashed border-gray-700 rounded text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
      >
        + Add Participant
      </button>

      {errors.participants && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.participants}
        </p>
      )}
    </div>
  );
}

// Step 6: Vehicles
function StepVehicles({ data, addVehicle, updateVehicle, removeVehicle }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Vehicles & Equipment</h3>
      <p className="text-sm text-gray-400">Optional - Add vehicles involved in the incident</p>

      {data.vehicles.map((v: any, i: number) => (
        <div key={i} className="bg-gray-800 p-4 rounded border border-gray-700 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-medium">Vehicle {i + 1}</h4>
            <button
              onClick={() => removeVehicle(i)}
              className="text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Type</label>
              <input
                type="text"
                value={v.type}
                onChange={(e) => updateVehicle(i, 'type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                placeholder="e.g., Forklift, MAFI Truck"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">ID/Number</label>
              <input
                type="text"
                value={v.id}
                onChange={(e) => updateVehicle(i, 'id', e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                placeholder="e.g., FL-42"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addVehicle}
        className="w-full py-3 border-2 border-dashed border-gray-700 rounded text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-colors"
      >
        + Add Vehicle
      </button>
    </div>
  );
}

// Step 7: Initial State
function StepInitialState({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Initial State (T0)</h3>
      <p className="text-sm text-gray-400">
        Describe the initial state before the incident sequence began
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description *
        </label>
        <textarea
          value={data.initialDescription}
          onChange={(e) => updateData('initialDescription', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
          placeholder="e.g., MAFI truck positioned at ramp base, spotter in position, forklift approaching from south..."
        />
        {errors.initialDescription && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.initialDescription}
          </p>
        )}
      </div>
    </div>
  );
}

// Step 8: Review
function StepReview({ data, updateData, errors }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Review & Confirm</h3>

      <div className="bg-gray-800 p-4 rounded border border-gray-700 space-y-3">
        <div>
          <p className="text-sm text-gray-400">Project Name</p>
          <p className="text-white">{data.projectName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Incident Date/Time</p>
          <p className="text-white">{data.incidentDate} at {data.incidentTime}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Location</p>
          <p className="text-white">{data.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Scene Type</p>
          <p className="text-white">{data.sceneType === 'vessel-deck' ? 'Vessel Deck' : 'Port Road'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Dimensions</p>
          <p className="text-white">{data.sceneWidth}m × {data.sceneHeight}m</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Participants</p>
          <p className="text-white">{data.participants.length} participant(s)</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Vehicles</p>
          <p className="text-white">{data.vehicles.length} vehicle(s)</p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.confirmed}
          onChange={(e) => updateData('confirmed', e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-gray-300">
          I confirm that the information above is accurate and ready for incident reconstruction. This project will be used for court-safe documentation.
        </span>
      </label>

      {errors.confirmed && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errors.confirmed}
        </p>
      )}
    </div>
  );
}
