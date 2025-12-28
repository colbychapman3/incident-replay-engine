'use client';

import { useMemo } from 'react';
import { Layer, Line, Text } from 'react-konva';
import { SceneObject, EnvelopeVisibilityConfig } from '@/types/scene';
import { CoordinateSystem, worldToCanvas } from '@/lib/coordinates';
import { calculateForkliftVision } from '@/lib/envelopes/forklift-vision';
import { calculateMafiSwing } from '@/lib/envelopes/mafi-swing';
import { calculateSpotterLOS } from '@/lib/envelopes/spotter-los';
import { calculateRampClearance } from '@/lib/envelopes/ramp-clearance';
import { Polygon } from '@/types/geometry';

interface EnvelopeLayerProps {
  objects: SceneObject[];
  envelopeVisibility: EnvelopeVisibilityConfig;
  coordinateSystem: CoordinateSystem;
}

export function EnvelopeLayer({
  objects,
  envelopeVisibility,
  coordinateSystem
}: EnvelopeLayerProps) {
  return (
    <Layer listening={false}>
      {/* Forklift Vision Cones */}
      {envelopeVisibility.forkliftVision && objects
        .filter(obj => obj.assetId.includes('forklift'))
        .map(forklift => (
          <ForkliftVisionOverlay
            key={`forklift-vision-${forklift.id}`}
            forklift={forklift}
            coordinateSystem={coordinateSystem}
          />
        ))
      }

      {/* MAFI Swing Envelopes */}
      {envelopeVisibility.mafiSwing && objects
        .filter(obj => obj.assetId.includes('mafi-truck'))
        .map(truck => {
          const trailer = objects.find(obj => obj.assetId.includes('mafi-trailer'));
          if (!trailer) return null;
          return (
            <MafiSwingOverlay
              key={`mafi-swing-${truck.id}`}
              truck={truck}
              trailer={trailer}
              coordinateSystem={coordinateSystem}
            />
          );
        })
      }

      {/* Spotter Line-of-Sight */}
      {envelopeVisibility.spotterLOS && objects
        .filter(obj => obj.type === 'actor' && obj.assetId.includes('spotter'))
        .map(spotter => (
          <SpotterLOSOverlay
            key={`spotter-los-${spotter.id}`}
            spotter={spotter}
            objects={objects}
            coordinateSystem={coordinateSystem}
          />
        ))
      }

      {/* Ramp Clearance (if ramps are added later) */}
      {envelopeVisibility.rampClearance && objects
        .filter(obj => obj.properties.isRamp === true)
        .map(ramp => (
          <RampClearanceOverlay
            key={`ramp-clearance-${ramp.id}`}
            ramp={ramp}
            vehicles={objects.filter(obj => obj.type === 'vehicle')}
            coordinateSystem={coordinateSystem}
          />
        ))
      }
    </Layer>
  );
}

// Helper to convert polygon to canvas points
function polygonToCanvasPoints(polygon: Polygon, coordinateSystem: CoordinateSystem): number[] {
  return polygon.points.flatMap(p => {
    const canvas = worldToCanvas(p, coordinateSystem);
    return [canvas.x, canvas.y];
  });
}

// Forklift Vision Overlay
function ForkliftVisionOverlay({ forklift, coordinateSystem }: { forklift: SceneObject; coordinateSystem: CoordinateSystem }) {
  const envelope = useMemo(() => {
    const position = forklift.properties.position || { x: 0, y: 0 };
    const rotation = forklift.properties.rotation || 0;
    const forkHeight = forklift.properties.forkHeight || 0;
    const hasLoad = forklift.properties.hasLoad || false;

    return calculateForkliftVision({
      id: forklift.id,
      position,
      rotation,
      forkHeight,
      hasLoad
    });
  }, [forklift.id, forklift.properties.position, forklift.properties.rotation, forklift.properties.forkHeight, forklift.properties.hasLoad]);

  return (
    <>
      {/* Vision Cone (Green) */}
      <Line
        points={polygonToCanvasPoints(envelope.visionCone, coordinateSystem)}
        fill="rgba(76, 175, 80, 0.2)"
        stroke="rgba(76, 175, 80, 0.5)"
        strokeWidth={2}
        closed
        listening={false}
      />

      {/* Blind Spots (Red) */}
      {envelope.blindSpots.map((blindSpot, idx) => (
        <Line
          key={`${forklift.id}-blind-${idx}`}
          points={polygonToCanvasPoints(blindSpot, coordinateSystem)}
          fill="rgba(244, 67, 54, 0.15)"
          stroke="rgba(244, 67, 54, 0.4)"
          strokeWidth={1}
          dash={[5, 5]}
          closed
          listening={false}
        />
      ))}
    </>
  );
}

// MAFI Swing Overlay
function MafiSwingOverlay({ truck, trailer, coordinateSystem }: { truck: SceneObject; trailer: SceneObject; coordinateSystem: CoordinateSystem }) {
  const envelope = useMemo(() => {
    const truckPos = truck.properties.position || { x: 0, y: 0 };
    const truckRot = truck.properties.rotation || 0;
    const trailerPos = trailer.properties.position || { x: 0, y: 0 };
    const trailerRot = trailer.properties.rotation || 0;
    const articulationAngle = trailerRot - truckRot;

    return calculateMafiSwing({
      truckId: truck.id,
      trailerId: trailer.id,
      truckPosition: truckPos,
      truckRotation: truckRot,
      trailerPosition: trailerPos,
      trailerRotation: trailerRot,
      articulationAngle,
      trailerLength: 12.0,
      trailerWidth: 2.5
    });
  }, [truck.id, trailer.id, truck.properties.position, truck.properties.rotation, trailer.properties.position, trailer.properties.rotation]);

  return (
    <>
      {/* Inner Sweep */}
      <Line
        points={polygonToCanvasPoints(envelope.innerSweep, coordinateSystem)}
        fill="rgba(255, 152, 0, 0.1)"
        stroke="rgba(255, 152, 0, 0.3)"
        strokeWidth={1}
        dash={[3, 3]}
        closed
        listening={false}
      />

      {/* Outer Sweep */}
      <Line
        points={polygonToCanvasPoints(envelope.outerSweep, coordinateSystem)}
        fill="rgba(255, 152, 0, 0.15)"
        stroke="rgba(255, 152, 0, 0.4)"
        strokeWidth={2}
        dash={[5, 5]}
        closed
        listening={false}
      />
    </>
  );
}

// Spotter Line-of-Sight Overlay
function SpotterLOSOverlay({ spotter, objects, coordinateSystem }: { spotter: SceneObject; objects: SceneObject[]; coordinateSystem: CoordinateSystem }) {
  const envelopes = useMemo(() => {
    const spotterPos = spotter.properties.position || { x: 0, y: 0 };
    const vehicles = objects.filter(obj => obj.type === 'vehicle' && obj.id !== spotter.id);

    return vehicles.map(vehicle => {
      const targetPos = vehicle.properties.position || { x: 0, y: 0 };

      return calculateSpotterLOS({
        spotter: {
          id: spotter.id,
          position: spotterPos,
          visionRange: 20
        },
        target: {
          id: vehicle.id,
          position: targetPos
        },
        obstacles: objects
          .filter(obj => obj.id !== spotter.id && obj.id !== vehicle.id)
          .map(obj => ({
            id: obj.id,
            position: obj.properties.position || { x: 0, y: 0 },
            boundingBox: {
              points: [
                { x: (obj.properties.position?.x || 0) - 1, y: (obj.properties.position?.y || 0) - 1 },
                { x: (obj.properties.position?.x || 0) + 1, y: (obj.properties.position?.y || 0) - 1 },
                { x: (obj.properties.position?.x || 0) + 1, y: (obj.properties.position?.y || 0) + 1 },
                { x: (obj.properties.position?.x || 0) - 1, y: (obj.properties.position?.y || 0) + 1 }
              ],
              closed: true
            }
          }))
      });
    });
  }, [spotter.id, spotter.properties.position, objects]);

  return (
    <>
      {envelopes.map(envelope => {
        const startCanvas = worldToCanvas(envelope.sightLine.start, coordinateSystem);
        const endCanvas = worldToCanvas(envelope.sightLine.end, coordinateSystem);

        return (
          <Line
            key={`${envelope.spotterId}-${envelope.targetId}`}
            points={[startCanvas.x, startCanvas.y, endCanvas.x, endCanvas.y]}
            stroke={envelope.sightLine.obstructed ? 'rgba(244, 67, 54, 0.6)' : 'rgba(76, 175, 80, 0.6)'}
            strokeWidth={2}
            dash={envelope.sightLine.obstructed ? [5, 5] : []}
            listening={false}
          />
        );
      })}
    </>
  );
}

// Ramp Clearance Overlay
function RampClearanceOverlay({ ramp, vehicles, coordinateSystem }: { ramp: SceneObject; vehicles: SceneObject[]; coordinateSystem: CoordinateSystem }) {
  const envelope = useMemo(() => {
    const rampBoundary = ramp.properties.boundary || {
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 }
      ],
      closed: true
    };

    return calculateRampClearance({
      ramp: {
        id: ramp.id,
        position: ramp.properties.position || { x: 0, y: 0 },
        boundary: rampBoundary,
        clearanceHeight: ramp.properties.clearanceHeight || 3.5
      },
      vehicles: vehicles.map(v => ({
        id: v.id,
        position: v.properties.position || { x: 0, y: 0 },
        height: v.properties.height || 3.0
      }))
    });
  }, [ramp.id, ramp.properties, vehicles]);

  return (
    <>
      {/* Ramp Boundary */}
      <Line
        points={polygonToCanvasPoints(envelope.boundary, coordinateSystem)}
        stroke="rgba(156, 39, 176, 0.6)"
        strokeWidth={2}
        dash={[10, 5]}
        closed
        listening={false}
      />

      {/* Violation Markers */}
      {envelope.violations.map((violation: { vehicleId: string; vehicleHeight: number; exceedance: number; position: { x: number; y: number } }) => {
        const canvasPos = worldToCanvas(violation.position, coordinateSystem);
        return (
          <Text
            key={`violation-${violation.vehicleId}`}
            x={canvasPos.x}
            y={canvasPos.y - 20}
            text={`⚠ +${violation.exceedance.toFixed(1)}m`}
            fontSize={14}
            fill="#F44336"
            fontStyle="bold"
            listening={false}
          />
        );
      })}
    </>
  );
}
