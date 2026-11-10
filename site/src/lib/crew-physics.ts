/**
 * crew-physics.ts
 * Kinematic Spring Physics & Gaze IK Engine for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Semi-implicit Euler harmonic spring-damper integrator for 2D position (x, y)
 * 2. Squash-and-stretch deformation springs for step-planting, anticipation, and recoil
 * 3. Gaze Inverse Kinematics (Gaze IK) for SVG <circle class="k"> eye pupils
 * 4. Dynamic negative-space bounding box avoidance (protects .plate__id and navigation cues)
 */

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ActorSpringConfig {
  stiffness?: number; // Spring constant k (default ~180)
  damping?: number;   // Damping constant c (default ~18)
  mass?: number;      // Inertial mass m (default 1.0)
  maxSpeed?: number;  // Max translation velocity px/s (default 1400)
  breathingFreq?: number;  // Phase frequency \omega_i in rad/s
  breathingPhase?: number; // Phase offset \phi_i in radians
}

export interface ActorPhysicsState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  scaleX: number;
  scaleY: number;
  vScaleX: number;
  vScaleY: number;
  targetScaleX: number;
  targetScaleY: number;
  gazeX: number;
  gazeY: number;
  headTilt: number;
  breathingFreq: number;
  breathingPhase: number;
  width: number;
  height: number;
  stiffness: number;
  damping: number;
  mass: number;
  maxSpeed: number;
  isWalking: boolean;
  walkCycle: number;
}

export class CrewPhysicsEngine {
  private actors = new Map<string, ActorPhysicsState>();
  private obstacles: Rect[] = [];
  private margin = 12;
  private totalSimTime = 0;

  /** Registers or updates an actor in the physics world */
  public addActor(
    id: string,
    initial: { x: number; y: number; width?: number; height?: number },
    config: ActorSpringConfig = {}
  ): ActorPhysicsState {
    const width = initial.width ?? 80;
    const height = initial.height ?? 80;

    // Distinct phase-shifted breathing rhythms per character
    const DEFAULT_BREATHING: Record<string, { freq: number; phase: number }> = {
      oops:  { freq: 1.35, phase: 0.42 },
      tsugi: { freq: 0.82, phase: 2.15 },
      kiki:  { freq: 1.85, phase: 1.25 },
      fude:  { freq: 1.12, phase: 3.75 },
      uso:   { freq: 0.94, phase: 4.80 },
    };

    const breath = DEFAULT_BREATHING[id] ?? { freq: 1.0, phase: 0.0 };

    const actor: ActorPhysicsState = {
      id,
      x: initial.x,
      y: initial.y,
      vx: 0,
      vy: 0,
      targetX: initial.x,
      targetY: initial.y,
      scaleX: 1.0,
      scaleY: 1.0,
      vScaleX: 0,
      vScaleY: 0,
      targetScaleX: 1.0,
      targetScaleY: 1.0,
      gazeX: 0,
      gazeY: 0,
      headTilt: 0,
      breathingFreq: config.breathingFreq ?? breath.freq,
      breathingPhase: config.breathingPhase ?? breath.phase,
      width,
      height,
      stiffness: config.stiffness ?? 190,
      damping: config.damping ?? 19,
      mass: config.mass ?? 1.0,
      maxSpeed: config.maxSpeed ?? 1400,
      isWalking: false,
      walkCycle: 0,
    };
    this.actors.set(id, actor);
    return actor;
  }

  public getActor(id: string): ActorPhysicsState | undefined {
    return this.actors.get(id);
  }

  public setTarget(id: string, x: number, y: number): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.targetX = x;
    actor.targetY = y;
  }

  /** Teleports an actor without spring velocity */
  public setPosition(id: string, x: number, y: number): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.x = x;
    actor.y = y;
    actor.targetX = x;
    actor.targetY = y;
    actor.vx = 0;
    actor.vy = 0;
  }

  /** Applies an instantaneous impulse (e.g. shockwave recoil from hammer strike) */
  public applyImpulse(
    id: string,
    ivx: number,
    ivy: number,
    squashX = 1.35,
    squashY = 0.72
  ): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.vx += ivx;
    actor.vy += ivy;
    actor.scaleX = squashX;
    actor.scaleY = squashY;
    actor.vScaleX = (1.0 - squashX) * 12;
    actor.vScaleY = (1.0 - squashY) * 12;
  }

  /** Sets protected negative-space bounding boxes (e.g. .plate__id, nav cues) */
  public setObstacles(obstacles: Rect[]): void {
    this.obstacles = obstacles;
  }

  /**
   * Clamps a coordinate (x, y) so that an actor's bounding box never collides with
   * protected obstacles or drifts off the ceramic plate bounds.
   */
  public clampToNegativeSpace(
    x: number,
    y: number,
    actorW: number,
    actorH: number,
    stageBounds: { width: number; height: number },
    allowTopRim = false
  ): { x: number; y: number } {
    const halfW = actorW / 2;
    // Boundary clamps
    let clampedX = Math.max(halfW + this.margin, Math.min(stageBounds.width - halfW - this.margin, x));
    let clampedY = Math.max(actorH + this.margin, Math.min(stageBounds.height - 8, y));

    if (allowTopRim) {
      // Characters meant for the rim (like Kiki) can sit comfortably near the top
      clampedY = Math.max(actorH * 0.7, Math.min(stageBounds.height - 8, y));
      return { x: clampedX, y: clampedY };
    }

    // Resolve collision with protected obstacle rectangles
    for (const obs of this.obstacles) {
      // Actor's footprint rectangle centered at x horizontally, bottom at y
      const actorLeft = clampedX - halfW;
      const actorRight = clampedX + halfW;
      const actorTop = clampedY - actorH;
      const actorBottom = clampedY;

      // Check overlap
      const overlapX = actorRight > obs.left - this.margin && actorLeft < obs.right + this.margin;
      const overlapY = actorBottom > obs.top - this.margin && actorTop < obs.bottom + this.margin;

      if (overlapX && overlapY) {
        const pushUp = clampedY - (obs.top - this.margin);
        const pushDown = obs.bottom + actorH + this.margin - clampedY;
        const pushLeft = clampedX - (obs.left - halfW - this.margin);
        const pushRight = (obs.right + halfW + this.margin) - clampedX;

        // If pushing down stays within stage bounds and is shorter, push down; otherwise push up (e.g. bottom cues)
        if (pushDown < pushUp && clampedY + pushDown <= stageBounds.height - 8) {
          clampedY += pushDown;
        } else if (clampedY - pushUp >= actorH + this.margin) {
          clampedY = obs.top - this.margin;
        } else if (pushLeft < pushRight && obs.left - halfW - this.margin >= halfW + this.margin) {
          clampedX = obs.left - halfW - this.margin;
        } else {
          clampedX = Math.min(stageBounds.width - halfW - this.margin, obs.right + halfW + this.margin);
        }
      }
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Advances the simulation by dt seconds (clamped to prevent instability).
   */
  public update(
    dt: number,
    pointer: { x: number; y: number },
    stageBounds: { width: number; height: number },
    options?: { allowTopRimIds?: string[] }
  ): void {
    const step = Math.min(0.04, Math.max(0.001, dt));
    const topRimSet = new Set(options?.allowTopRimIds ?? []);

    for (const actor of this.actors.values()) {
      const isRim = topRimSet.has(actor.id);
      // 1. Clamp target to negative space
      const safeTarget = this.clampToNegativeSpace(
        actor.targetX,
        actor.targetY,
        actor.width,
        actor.height,
        stageBounds,
        isRim
      );

      // 2. Semi-implicit Euler spring integration for position
      const dx = safeTarget.x - actor.x;
      const dy = safeTarget.y - actor.y;

      let ax = (dx * actor.stiffness - actor.vx * actor.damping) / actor.mass;
      let ay = (dy * actor.stiffness - actor.vy * actor.damping) / actor.mass;

      // Soft potential field & damped margin repulsion for obstacles
      if (!isRim) {
        const halfW = actor.width * 0.44;
        const aLeft = actor.x - halfW;
        const aRight = actor.x + halfW;
        const aTop = actor.y - actor.height;
        const aBottom = actor.y;

        const kRep = 320;
        const cRep = 26;

        for (const obs of this.obstacles) {
          const obsL = obs.left - this.margin;
          const obsR = obs.right + this.margin;
          const obsT = obs.top - this.margin;
          const obsB = obs.bottom + this.margin;

          if (aRight > obsL && aLeft < obsR && aBottom > obsT && aTop < obsB) {
            const penLeft = aRight - obsL;
            const penRight = obsR - aLeft;
            const penUp = aBottom - obsT;
            const penDown = obsB - aTop;

            const minPenX = Math.min(penLeft, penRight);
            const minPenY = Math.min(penUp, penDown);

            if (minPenX < minPenY) {
              if (penLeft < penRight) {
                ax += (-penLeft * kRep) / actor.mass;
                if (actor.vx > 0) actor.vx -= actor.vx * Math.min(1.0, cRep * step);
                if (penLeft > 4) actor.x -= penLeft * 0.12;
              } else {
                ax += (penRight * kRep) / actor.mass;
                if (actor.vx < 0) actor.vx -= actor.vx * Math.min(1.0, cRep * step);
                if (penRight > 4) actor.x += penRight * 0.12;
              }
            } else {
              if (penUp < penDown) {
                ay += (-penUp * kRep) / actor.mass;
                if (actor.vy > 0) actor.vy -= actor.vy * Math.min(1.0, cRep * step);
                if (penUp > 4) actor.y -= penUp * 0.12;
              } else {
                ay += (penDown * kRep) / actor.mass;
                if (actor.vy < 0) actor.vy -= actor.vy * Math.min(1.0, cRep * step);
                if (penDown > 4) actor.y += penDown * 0.12;
              }
            }
          }
        }
      }

      actor.vx += ax * step;
      actor.vy += ay * step;

      // Speed limit
      const speed = Math.hypot(actor.vx, actor.vy);
      if (speed > actor.maxSpeed) {
        const factor = actor.maxSpeed / speed;
        actor.vx *= factor;
        actor.vy *= factor;
      }

      actor.x += actor.vx * step;
      actor.y += actor.vy * step;

      // Safe bounds clamping
      const halfW = actor.width / 2;
      actor.x = Math.max(halfW + 4, Math.min(stageBounds.width - halfW - 4, actor.x));
      if (isRim) {
        actor.y = Math.max(actor.height * 0.65, Math.min(stageBounds.height - 6, actor.y));
      } else {
        actor.y = Math.max(actor.height + 4, Math.min(stageBounds.height - 6, actor.y));
        const resolved = this.clampToNegativeSpace(actor.x, actor.y, actor.width, actor.height, stageBounds, false);
        if (resolved.x !== actor.x) {
          actor.x = resolved.x;
          actor.vx *= -0.2;
        }
        if (resolved.y !== actor.y) {
          actor.y = resolved.y;
          actor.vy *= -0.2;
        }
      }

      // 3. Dynamic squash-and-stretch & phase-shifted breathing
      this.totalSimTime += step;
      const isMoving = speed > 35;
      actor.isWalking = isMoving;

      if (isMoving) {
        actor.walkCycle += step * Math.min(18, speed * 0.04);
        const hop = Math.sin(actor.walkCycle);
        actor.targetScaleX = 1.0 + Math.min(0.18, speed * 0.0003) - hop * 0.05;
        actor.targetScaleY = 1.0 - Math.min(0.15, speed * 0.00025) + hop * 0.07;
      } else {
        // Individual phase-shifted breathing rhythm (\omega_i * t + \phi_i)
        actor.walkCycle = 0;
        const breath = Math.sin(this.totalSimTime * actor.breathingFreq + actor.breathingPhase);
        actor.targetScaleX = 1.0 - breath * 0.012;
        actor.targetScaleY = 1.0 + breath * 0.018;
      }

      // Spring integration for scale (snappy squash recovery)
      const scaleK = 260;
      const scaleC = 22;
      const axScale = (actor.targetScaleX - actor.scaleX) * scaleK - actor.vScaleX * scaleC;
      const ayScale = (actor.targetScaleY - actor.scaleY) * scaleK - actor.vScaleY * scaleC;

      actor.vScaleX += axScale * step;
      actor.vScaleY += ayScale * step;
      actor.scaleX += actor.vScaleX * step;
      actor.scaleY += actor.vScaleY * step;

      // 4. Gaze Inverse Kinematics (Gaze IK) with sub-pixel interpolation and strict boundary clamping
      const faceWorldX = actor.x + ((65 / 148) - 0.5) * actor.width;
      const faceWorldY = actor.y - actor.height + (80 / 148) * actor.height;

      const gdx = pointer.x - faceWorldX;
      const gdy = pointer.y - faceWorldY;
      const dist = Math.hypot(gdx, gdy);

      // Max eye pupil shift in SVG coordinates (~2.4px radius max, strictly <= 2.4px)
      const maxPupilShift = 2.4;
      const gazeStrength = Math.min(1.0, dist / 240);
      const angle = Math.atan2(gdy, gdx);

      const targetGazeX = Math.cos(angle) * maxPupilShift * gazeStrength;
      const targetGazeY = Math.sin(angle) * maxPupilShift * gazeStrength;

      // Subtle responsive head tilt (-4deg to +4deg)
      const targetTilt = Math.sin(angle) * 3.8 * gazeStrength;
      actor.headTilt += (targetTilt - actor.headTilt) * Math.min(1.0, step * 8.0);

      // Sub-pixel smooth lerp to eliminate pupil jitter
      const gazeLerp = Math.min(1.0, step * 16.0);
      actor.gazeX += (targetGazeX - actor.gazeX) * gazeLerp;
      actor.gazeY += (targetGazeY - actor.gazeY) * gazeLerp;

      // Strict radial clamping so r <= 2.4px at all times
      const rGaze = Math.hypot(actor.gazeX, actor.gazeY);
      if (rGaze > maxPupilShift) {
        actor.gazeX = (actor.gazeX / rGaze) * maxPupilShift;
        actor.gazeY = (actor.gazeY / rGaze) * maxPupilShift;
      }
    }
  }
}

export const createCrewPhysics = (): CrewPhysicsEngine => new CrewPhysicsEngine();
