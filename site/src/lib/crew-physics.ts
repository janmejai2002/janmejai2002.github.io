/**
 * crew-physics.ts
 * Kinematic Spring Physics & Gaze IK Engine for wAIbi-sabi Living Ceramic Terrarium.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Semi-implicit Euler harmonic spring-damper integrator for 2D position (x, y).
 * 2. Strict volume-conserving harmonic respiration (S_x * S_y = 1.0) with coprime frequencies (\omega_i, \phi_i).
 * 3. Gaze Inverse Kinematics (Gaze IK) with hyperbolic tangent saturation for SVG <circle class="k"> eye pupils.
 * 4. Khatib continuous artificial potential field repulsion around headline text and navigation cues.
 * 5. Viewport-aware macro-staging docks for all 5 figurines across desktop and mobile.
 */

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ActorSpringConfig {
  stiffness?: number; // Spring constant k (default ~190)
  damping?: number;   // Damping constant c (default ~19)
  mass?: number;      // Inertial mass m (default 1.0)
  maxSpeed?: number;  // Max translation velocity px/s (default 1400)
  breathingFreq?: number;  // Phase frequency \omega_i in rad/s
  breathingPhase?: number; // Phase offset \phi_i in radians
  breathingAmp?: number;   // Amplitude A_i
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
  breathingAmp: number;
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
  private margin = 16;
  private totalSimTime = 0;

  /** Registers or updates an actor in the physics world */
  public addActor(
    id: string,
    initial: { x: number; y: number; width?: number; height?: number },
    config: ActorSpringConfig = {}
  ): ActorPhysicsState {
    const width = initial.width ?? 80;
    const height = initial.height ?? 80;

    // Distinct biological breathing rhythms per companion (\omega_i, \phi_i)
    const DEFAULT_BREATHING: Record<string, { freq: number; phase: number; amp: number }> = {
      tsugi: { freq: 0.82, phase: 0.00, amp: 0.016 },
      oops:  { freq: 1.35, phase: 1.04, amp: 0.022 },
      kiki:  { freq: 1.85, phase: 2.09, amp: 0.025 },
      fude:  { freq: 0.65, phase: 3.14, amp: 0.014 },
      uso:   { freq: 0.94, phase: 4.19, amp: 0.018 },
    };

    const breath = DEFAULT_BREATHING[id] ?? { freq: 1.0, phase: 0.0, amp: 0.018 };

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
      breathingAmp: config.breathingAmp ?? breath.amp,
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

  public getAllActors(): ActorPhysicsState[] {
    return Array.from(this.actors.values());
  }

  public setTarget(id: string, x: number, y: number): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    actor.targetX = x;
    actor.targetY = y;
  }

  /** Teleports an actor without residual velocity */
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

  /** Sets protected negative-space bounding boxes (e.g. .plate__id, .claim, nav cues) */
  public setObstacles(obstacles: Rect[]): void {
    this.obstacles = obstacles;
  }

  /**
   * Deterministic macro-staging resting docks for all 5 companions.
   * Tailored for zero text occlusion across desktop and mobile.
   * Docks figurines strictly in side gutters and top perimeter, leaving reading column clear.
   */
  public getRestTargets(
    stageWidth: number,
    stageHeight: number,
    textBounds?: { left: number; right: number }
  ): Record<string, { x: number; y: number }> {
    const isMobile = stageWidth < 900;

    if (isMobile) {
      // On mobile, all figurines park off-stage by default for zero text clutter
      return {
        kiki:  { x: stageWidth + 80,  y: 28 },
        tsugi: { x: -90,              y: stageHeight * 0.42 },
        oops:  { x: stageWidth + 90,  y: stageHeight * 0.42 },
        fude:  { x: -90,              y: stageHeight * 0.82 },
        uso:   { x: stageWidth + 90,  y: stageHeight * 0.82 },
      };
    }

    // On desktop, only Kiki rests serenely on the top right rim shelf.
    // The other 4 figurines park off-stage until interaction triggers their entrance.
    return {
      kiki:  { x: stageWidth - 68, y: 26 }, // Top right rim, completely clear of thesis h1
      tsugi: { x: -90,             y: stageHeight * 0.40 }, // Off-stage left
      fude:  { x: -90,             y: stageHeight * 0.78 }, // Off-stage left
      oops:  { x: stageWidth + 90, y: stageHeight * 0.40 }, // Off-stage right
      uso:   { x: stageWidth + 90, y: stageHeight * 0.78 }, // Off-stage right
    };
  }

  /**
   * Khatib Continuous Artificial Potential Field Repulsion.
   * Smoothly deflects actors away from text obstacles without abrupt clipping.
   */
  public computeRepulsion(px: number, py: number): { fx: number; fy: number } {
    let fx = 0;
    let fy = 0;

    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];

      // Find closest point on obstacle AABB
      const cx = Math.max(obs.left, Math.min(px, obs.right));
      const cy = Math.max(obs.top, Math.min(py, obs.bottom));

      const dx = px - cx;
      const dy = py - cy;
      const distSq = dx * dx + dy * dy;
      const d0 = 48.0; // 48px protective cushion

      if (distSq < d0 * d0 && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const weight = 2200.0;
        const repFactor = weight * (1.0 / dist - 1.0 / d0) * (1.0 / distSq);
        fx += (dx / dist) * repFactor;
        fy += (dy / dist) * repFactor;
      }
    }

    return { fx, fy };
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
    let clampedX = Math.max(halfW + 4, Math.min(stageBounds.width - halfW - 4, x));
    let clampedY = Math.max(actorH + 4, Math.min(stageBounds.height - 8, y));

    if (allowTopRim) {
      clampedY = Math.max(actorH * 0.65, Math.min(stageBounds.height - 8, y));
      return { x: clampedX, y: clampedY };
    }

    // Resolve collision with protected obstacle rectangles
    for (const obs of this.obstacles) {
      const actorLeft = clampedX - halfW;
      const actorRight = clampedX + halfW;
      const actorTop = clampedY - actorH;
      const actorBottom = clampedY;

      const overlapX = actorRight > obs.left - this.margin && actorLeft < obs.right + this.margin;
      const overlapY = actorBottom > obs.top - this.margin && actorTop < obs.bottom + this.margin;

      if (overlapX && overlapY) {
        const pushUp = clampedY - (obs.top - this.margin);
        const pushDown = obs.bottom + actorH + this.margin - clampedY;
        const pushLeft = clampedX - (obs.left - halfW - this.margin);
        const pushRight = (obs.right + halfW + this.margin) - clampedX;

        if (pushDown < pushUp && clampedY + pushDown <= stageBounds.height - 8) {
          clampedY += pushDown;
        } else if (clampedY - pushUp >= actorH + 4) {
          clampedY = obs.top - this.margin;
        } else if (pushLeft < pushRight && obs.left - halfW - this.margin >= halfW + 4) {
          clampedX = obs.left - halfW - this.margin;
        } else {
          clampedX = Math.min(stageBounds.width - halfW - 4, obs.right + halfW + this.margin);
        }
      }
    }

    return { x: clampedX, y: clampedY };
  }

  /**
   * Advances the simulation by dt seconds.
   */
  public update(
    dt: number,
    pointer: { x: number; y: number },
    stageBounds: { width: number; height: number },
    options?: { allowTopRimIds?: string[]; isContemplating?: boolean }
  ): void {
    const step = Math.min(0.04, Math.max(0.001, dt));
    const topRimSet = new Set(options?.allowTopRimIds ?? ['kiki']);
    const isContemplating = options?.isContemplating ?? false;

    for (const actor of this.actors.values()) {
      const isRim = topRimSet.has(actor.id);

      // 1. Clamp target anchor to negative space
      const safeTarget = this.clampToNegativeSpace(
        actor.targetX,
        actor.targetY,
        actor.width,
        actor.height,
        stageBounds,
        isRim
      );

      // 2. Semi-implicit Euler spring integration
      const dx = safeTarget.x - actor.x;
      const dy = safeTarget.y - actor.y;

      let ax = (dx * actor.stiffness - actor.vx * actor.damping) / actor.mass;
      let ay = (dy * actor.stiffness - actor.vy * actor.damping) / actor.mass;

      // Obstacle potential repulsion
      if (!isRim) {
        const rep = this.computeRepulsion(actor.x, actor.y);
        ax += rep.fx / actor.mass;
        ay += rep.fy / actor.mass;
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
      const isOffstage = actor.targetX < -20 || actor.targetX > stageBounds.width + 20;
      if (!isOffstage) {
        actor.x = Math.max(halfW + 4, Math.min(stageBounds.width - halfW - 4, actor.x));
      } else {
        // Allow actor to smoothly walk off-stage up to 160px outside
        actor.x = Math.max(-160, Math.min(stageBounds.width + 160, actor.x));
      }
      if (isRim) {
        actor.y = Math.max(actor.height * 0.65, Math.min(stageBounds.height - 6, actor.y));
      } else {
        actor.y = Math.max(actor.height + 4, Math.min(stageBounds.height - 6, actor.y));
      }

      // 3. Strict Volume-Conserving Harmonic Respiration (S_x * S_y = 1.0)
      this.totalSimTime += step;
      const isMoving = speed > 35;
      actor.isWalking = isMoving;

      if (isMoving) {
        actor.walkCycle += step * Math.min(18, speed * 0.04);
        const hop = Math.sin(actor.walkCycle);
        actor.targetScaleY = 1.0 - Math.min(0.14, speed * 0.0002) + hop * 0.06;
        actor.targetScaleX = 1.0 / actor.targetScaleY; // Strict volume conservation
      } else {
        actor.walkCycle = 0;
        // Asynchronous sinusoidal chest expansion (\omega_i * t + \phi_i)
        const breath = Math.sin(this.totalSimTime * actor.breathingFreq + actor.breathingPhase);
        actor.targetScaleY = 1.0 + breath * actor.breathingAmp;
        actor.targetScaleX = 1.0 / actor.targetScaleY; // S_x * S_y = 1.0
      }

      // Spring integration for scale recovery
      const scaleK = 260;
      const scaleC = 22;
      const axScale = (actor.targetScaleX - actor.scaleX) * scaleK - actor.vScaleX * scaleC;
      const ayScale = (actor.targetScaleY - actor.scaleY) * scaleK - actor.vScaleY * scaleC;

      actor.vScaleX += axScale * step;
      actor.vScaleY += ayScale * step;
      actor.scaleX += actor.vScaleX * step;
      actor.scaleY += actor.vScaleY * step;

      // 4. Gaze Inverse Kinematics (Gaze IK) with Hyperbolic Tangent Saturation
      const faceWorldX = actor.x + ((65 / 148) - 0.5) * actor.width;
      const faceWorldY = actor.y - actor.height + (80 / 148) * actor.height;

      let gdx = pointer.x - faceWorldX;
      let gdy = pointer.y - faceWorldY;

      // Ethological Gaze Aversion: during contemplative reading, gaze softly averts downward
      if (isContemplating) {
        gdx *= 0.35;
        gdy = Math.max(12, gdy * 0.35 + 24); // Relax eyes downward toward reading plane
      }

      const dist = Math.hypot(gdx, gdy);
      const angle = Math.atan2(gdy, gdx);
      const maxPupilShift = 2.4; // anatomical orbit bound

      // Hyperbolic tangent smooth saturation curve
      const sat = Math.tanh(dist / 220);
      const targetGazeX = Math.cos(angle) * maxPupilShift * sat;
      const targetGazeY = Math.sin(angle) * maxPupilShift * sat;

      // Head tilt bounded strictly within [-3.8deg, +3.8deg]
      const targetTilt = Math.sin(angle) * 3.6 * sat;
      actor.headTilt += (targetTilt - actor.headTilt) * Math.min(1.0, step * 7.5);

      // Sub-pixel smooth lerp to eliminate pupil jitter
      const gazeLerp = Math.min(1.0, step * 14.0);
      actor.gazeX += (targetGazeX - actor.gazeX) * gazeLerp;
      actor.gazeY += (targetGazeY - actor.gazeY) * gazeLerp;

      // Strict anatomical orbit clamping
      const rGaze = Math.hypot(actor.gazeX, actor.gazeY);
      if (rGaze > maxPupilShift) {
        actor.gazeX = (actor.gazeX / rGaze) * maxPupilShift;
        actor.gazeY = (actor.gazeY / rGaze) * maxPupilShift;
      }
    }
  }
}

export const createCrewPhysics = (): CrewPhysicsEngine => new CrewPhysicsEngine();
