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

  /** Registers or updates an actor in the physics world */
  public addActor(
    id: string,
    initial: { x: number; y: number; width?: number; height?: number },
    config: ActorSpringConfig = {}
  ): ActorPhysicsState {
    const width = initial.width ?? 80;
    const height = initial.height ?? 80;
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
        // Resolve along the axis with the shortest push-out distance
        const pushDown = obs.bottom + actorH + this.margin - clampedY;
        const pushLeft = clampedX - (obs.left - halfW - this.margin);
        const pushRight = (obs.right + halfW + this.margin) - clampedX;

        // If pushing down stays within stage bounds, push down (preferred for text)
        if (clampedY + pushDown <= stageBounds.height - 8) {
          clampedY += pushDown;
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

      const ax = (dx * actor.stiffness - actor.vx * actor.damping) / actor.mass;
      const ay = (dy * actor.stiffness - actor.vy * actor.damping) / actor.mass;

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

      // 3. Dynamic squash-and-stretch
      // When moving quickly, stretch in movement direction and compress along lateral
      const isMoving = speed > 35;
      actor.isWalking = isMoving;

      if (isMoving) {
        actor.walkCycle += step * Math.min(18, speed * 0.04);
        const hop = Math.sin(actor.walkCycle);
        actor.targetScaleX = 1.0 + Math.min(0.18, speed * 0.0003) - hop * 0.05;
        actor.targetScaleY = 1.0 - Math.min(0.15, speed * 0.00025) + hop * 0.07;
      } else {
        actor.targetScaleX = 1.0;
        actor.targetScaleY = 1.0;
        actor.walkCycle = 0;
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

      // 4. Gaze Inverse Kinematics (Gaze IK)
      // Actor's face in container space (approx 65/148 across, 80/148 down)
      const faceWorldX = actor.x + ((65 / 148) - 0.5) * actor.width;
      const faceWorldY = actor.y - actor.height + (80 / 148) * actor.height;

      const gdx = pointer.x - faceWorldX;
      const gdy = pointer.y - faceWorldY;
      const dist = Math.hypot(gdx, gdy);

      // Max eye pupil shift in SVG coordinates (~2.4px radius max)
      const maxPupilShift = 2.4;
      const gazeStrength = Math.min(1.0, dist / 240);
      const angle = Math.atan2(gdy, gdx);

      actor.gazeX = Math.cos(angle) * maxPupilShift * gazeStrength;
      actor.gazeY = Math.sin(angle) * maxPupilShift * gazeStrength;
    }
  }
}

export const createCrewPhysics = (): CrewPhysicsEngine => new CrewPhysicsEngine();
