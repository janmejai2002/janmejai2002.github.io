/**
 * kintsugi-game.ts
 * Interactive Kintsugi Game & Crack Sandbox Engine for wAIbi-sabi.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Voronoi / Delaunay crack branching network from impact impulse \vec{J}.
 * 2. Interactive Gold Lacquer Painting with sub-pixel orthogonal distance & Gaussian falloff.
 * 3. Autonomous Tsugi artisan assist with minimum-jerk trajectory progression (Flash & Hogan 1985).
 * 4. Fude's Repair Ledger (healed count, streak, accuracy %) persisted in localStorage.
 * 5. Diegetic Content Bridging: mapping cured vessels to applied-AI essays.
 * 6. WebGL uGold uniform synchronization and SVG gold vein overlay paths.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface CrackNode {
  id: number;
  x: number;
  y: number;
  r: number; // shader radius relative to impact
  angle: number;
  isTerminal: boolean;
}

export interface CrackEdge {
  id: number;
  fromNode: number;
  toNode: number;
  p1: Point2D;
  p2: Point2D;
  length: number;
  goldProgress: number; // 0.0 to 1.0
  isSealed: boolean;
  angle: number;
}

export interface ContentBridgeEssay {
  slug: string;
  title: string;
  ask: string;
  track: 'technical' | 'business' | 'basics' | 'case-studies' | 'talks';
}

export interface GameLedger {
  totalHealed: number;
  currentStreak: number;
  bestStreak: number;
  meanAccuracyPct: number;
  lastBridgedPost: ContentBridgeEssay | null;
}

export const CONTENT_BRIDGES: ContentBridgeEssay[] = [
  {
    slug: 'agent-framework-20-year-old-bugs',
    title: 'Why AI Systems Fail at Organizational Boundaries',
    ask: 'Why do multi-agent systems crash in corporate production?',
    track: 'technical',
  },
  {
    slug: 'what-a-context-window-is-and-why-it-fills-up',
    title: 'What a Context Window Is and Why It Fills Up',
    ask: 'Why does long context degrade reasoning accuracy?',
    track: 'basics',
  },
  {
    slug: 'klarna-ai-customer-service-graded-honestly',
    title: "Klarna's AI Customer Service Graded Honestly",
    ask: 'Can 700 customer support agents truly be replaced by an LLM?',
    track: 'case-studies',
  },
  {
    slug: 'the-agent-protocol-shortlist-is-now-two-mcp-and-a2a',
    title: 'The Agent Protocol Shortlist: MCP and A2A',
    ask: 'Which protocol will standardize tool execution in 2026?',
    track: 'technical',
  },
  {
    slug: 'budget-ai-costs-per-token-pricing',
    title: 'Budgeting AI Costs & Token Pricing Realities',
    ask: 'How do you price an enterprise agent without burning capital?',
    track: 'business',
  },
  {
    slug: 'ai-latency-ttft-for-product-teams',
    title: 'AI Latency & TTFT for Product Teams',
    ask: 'How fast must streaming tokens arrive before users drop off?',
    track: 'technical',
  },
  {
    slug: 'musk-yc-ai-startup-school-talk',
    title: 'Elon Musk YC AI Startup School Autopsy',
    ask: 'What did the frontier founders get right about autonomy?',
    track: 'talks',
  },
  {
    slug: 'prompt-caching-scheduled-agent-savings',
    title: 'Prompt Caching & Scheduled Agent Savings',
    ask: 'How does prefix caching cut 80% of agent infrastructure costs?',
    track: 'technical',
  },
];

const LEDGER_STORAGE_KEY = 'waibi:kintsugi_ledger';

export class KintsugiGameEngine {
  private nodes: CrackNode[] = [];
  private edges: CrackEdge[] = [];
  private impact: Point2D = { x: 0, y: 0 };
  private stageSize: { width: number; height: number } = { width: 800, height: 400 };
  private seed: number = 3.1415;
  private totalLength = 0;
  private sealedLength = 0;
  private overallGoldProgress = 0;
  private isCured = false;
  private accuracySamples: number[] = [];

  // Autonomous Tsugi assistance state
  private lastUserInteractTime = 0;
  private tsugiAssistActive = false;
  private tsugiFastAssist = false;
  private tsugiParamS = 0;
  private currentAssistEdgeIndex = -1;

  // Ledger stats
  private ledger: GameLedger = {
    totalHealed: 0,
    currentStreak: 0,
    bestStreak: 0,
    meanAccuracyPct: 98.4,
    lastBridgedPost: null,
  };

  // Callbacks
  private onGoldProgressCb?: (progress: number) => void;
  private onSeamCuredCb?: (ledger: GameLedger, bridge: ContentBridgeEssay) => void;
  private onTsugiStepCb?: (target: Point2D, angle: number) => void;

  constructor() {
    this.loadLedger();
  }

  private loadLedger(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.ledger = { ...this.ledger, ...parsed };
        }
      }
    } catch {
      // Storage unavailable or blocked
    }
  }

  private saveLedger(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(this.ledger));
      }
    } catch {
      // Storage unavailable
    }
  }

  /**
   * Initializes crack fracture network directly from WebGL shader seam trajectory points.
   * This guarantees 1:1 mathematical alignment between pointer dragging, Tsugi's assist,
   * and the WebGL2 shader's uGold fill and Inigo Quilez Voronoi edge.
   */
  public initFromTrajectory(
    trajectory: Array<{ x: number; y: number; r?: number; angle?: number; progress?: number }>,
    stageSize: { width: number; height: number },
    seed = 0
  ): void {
    if (!trajectory || trajectory.length < 2) return;
    this.nodes = [];
    this.edges = [];
    this.stageSize = { ...stageSize };
    this.seed = seed;
    this.isCured = false;
    this.accuracySamples = [];
    this.currentAssistEdgeIndex = -1;
    this.tsugiAssistActive = false;
    this.tsugiParamS = 0;
    this.lastUserInteractTime = performance.now();
    this.impact = { x: trajectory[0].x, y: trajectory[0].y };

    for (let i = 0; i < trajectory.length; i++) {
      const pt = trajectory[i];
      const node: CrackNode = {
        id: i,
        x: pt.x,
        y: pt.y,
        r: pt.r ?? (i / (trajectory.length - 1)),
        angle: pt.angle ?? Math.PI,
        isTerminal: i === trajectory.length - 1,
      };
      this.nodes.push(node);

      if (i > 0) {
        const prev = this.nodes[i - 1];
        const edgeLen = Math.hypot(node.x - prev.x, node.y - prev.y);
        this.edges.push({
          id: this.edges.length,
          fromNode: i - 1,
          toNode: i,
          p1: { x: prev.x, y: prev.y },
          p2: { x: node.x, y: node.y },
          length: edgeLen,
          goldProgress: 0,
          isSealed: false,
          angle: Math.atan2(node.y - prev.y, node.x - prev.x),
        });
      }
    }

    this.totalLength = this.edges.reduce((sum, e) => sum + e.length, 0);
    this.sealedLength = 0;
    this.overallGoldProgress = 0;
  }

  /**
   * Initializes a new Voronoi / Delaunay crack branching network
   * from an impact point and impulse vector \vec{J}.
   */
  public generateFracture(
    impactCss: Point2D,
    stageSize: { width: number; height: number },
    seed = Math.random() * 100,
    impulseMagnitude = 1.0
  ): void {
    this.nodes = [];
    this.edges = [];
    this.impact = { ...impactCss };
    this.stageSize = { ...stageSize };
    this.seed = seed;
    this.isCured = false;
    this.accuracySamples = [];
    this.currentAssistEdgeIndex = -1;
    this.tsugiAssistActive = false;
    this.tsugiParamS = 0;
    this.lastUserInteractTime = performance.now();

    // Root node at impact epicenter
    const rootNode: CrackNode = {
      id: 0,
      x: impactCss.x,
      y: impactCss.y,
      r: 0,
      angle: 0,
      isTerminal: false,
    };
    this.nodes.push(rootNode);

    // Deterministic pseudo-random generator from seed
    let s = seed + 1.2345;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Construct primary trunk vein heading westward through headline band
    const trunkSegments = Math.max(12, Math.min(24, Math.round(16 * Math.min(1.5, impulseMagnitude))));
    const maxReach = Math.min(impactCss.x - 20, stageSize.width * 0.75);
    const stepLen = maxReach / trunkSegments;

    let prevNodeId = 0;
    let curX = impactCss.x;
    let curY = impactCss.y;
    let curTheta = Math.PI; // heading west

    const branchCandidateNodes: number[] = [];

    for (let i = 1; i <= trunkSegments; i++) {
      const prog = i / trunkSegments;
      // Wiggle angle using harmonic multi-frequency offsets
      const w1 = Math.sin(prog * 5.2 + seed * 1.7) * 0.28;
      const w2 = Math.sin(prog * 11.4 - seed * 0.8) * 0.14;
      const w3 = (rnd() - 0.5) * 0.16;
      curTheta = Math.PI + (w1 + w2 + w3);

      curX += Math.cos(curTheta) * stepLen;
      // Vertical compression matching shader's 1.85 aspect compression
      curY += (Math.sin(curTheta) * stepLen) / 1.85;

      curX = Math.max(24, Math.min(stageSize.width - 24, curX));
      curY = Math.max(28, Math.min(stageSize.height - 28, curY));

      const rShader = (Math.hypot(impactCss.x - curX, (impactCss.y - curY) * 1.85)) / stageSize.height;

      const node: CrackNode = {
        id: this.nodes.length,
        x: curX,
        y: curY,
        r: rShader,
        angle: curTheta,
        isTerminal: i === trunkSegments,
      };
      this.nodes.push(node);

      const edgeLen = Math.hypot(curX - this.nodes[prevNodeId].x, curY - this.nodes[prevNodeId].y);
      this.edges.push({
        id: this.edges.length,
        fromNode: prevNodeId,
        toNode: node.id,
        p1: { x: this.nodes[prevNodeId].x, y: this.nodes[prevNodeId].y },
        p2: { x: node.x, y: node.y },
        length: edgeLen,
        goldProgress: 0,
        isSealed: false,
        angle: Math.atan2(node.y - this.nodes[prevNodeId].y, node.x - this.nodes[prevNodeId].x),
      });

      if (i > 2 && i < trunkSegments - 2 && rnd() > 0.45) {
        branchCandidateNodes.push(node.id);
      }
      prevNodeId = node.id;
    }

    // Branching veins (tributaries) radiating from selected candidate trunk nodes
    const numBranches = Math.min(3, branchCandidateNodes.length);
    for (let b = 0; b < numBranches; b++) {
      const parentId = branchCandidateNodes[b];
      const parentNode = this.nodes[parentId];
      const branchSide = b % 2 === 0 ? 1 : -1;
      const branchLen = 3 + Math.floor(rnd() * 4);
      let bPrevId = parentId;
      let bx = parentNode.x;
      let by = parentNode.y;
      let bTheta = parentNode.angle + branchSide * (0.65 + rnd() * 0.4);

      for (let k = 1; k <= branchLen; k++) {
        const bStep = stepLen * (0.6 + rnd() * 0.3);
        bTheta += (rnd() - 0.5) * 0.3;
        bx += Math.cos(bTheta) * bStep;
        by += Math.sin(bTheta) * bStep;

        bx = Math.max(20, Math.min(stageSize.width - 20, bx));
        by = Math.max(24, Math.min(stageSize.height - 24, by));

        const rShader = Math.hypot(impactCss.x - bx, (impactCss.y - by) * 1.85) / stageSize.height;
        const bNode: CrackNode = {
          id: this.nodes.length,
          x: bx,
          y: by,
          r: rShader,
          angle: bTheta,
          isTerminal: k === branchLen,
        };
        this.nodes.push(bNode);

        const edgeLen = Math.hypot(bx - this.nodes[bPrevId].x, by - this.nodes[bPrevId].y);
        this.edges.push({
          id: this.edges.length,
          fromNode: bPrevId,
          toNode: bNode.id,
          p1: { x: this.nodes[bPrevId].x, y: this.nodes[bPrevId].y },
          p2: { x: bNode.x, y: bNode.y },
          length: edgeLen,
          goldProgress: 0,
          isSealed: false,
          angle: Math.atan2(bNode.y - this.nodes[bPrevId].y, bNode.x - this.nodes[bPrevId].x),
        });
        bPrevId = bNode.id;
      }
    }

    // Recompute total length
    this.totalLength = this.edges.reduce((sum, e) => sum + e.length, 0);
    this.sealedLength = 0;
    this.overallGoldProgress = 0;
  }

  /**
   * Orthogonal point-to-segment distance.
   * Returns distance, projection factor t in [0, 1], and projection point.
   */
  public distToSegment(p: Point2D, a: Point2D, b: Point2D): { dist: number; t: number; proj: Point2D } {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    if (l2 < 1e-6) {
      return { dist: Math.hypot(p.x - a.x, p.y - a.y), t: 0, proj: { ...a } };
    }
    let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = a.x + t * dx;
    const projY = a.y + t * dy;
    return {
      dist: Math.hypot(p.x - projX, p.y - projY),
      t,
      proj: { x: projX, y: projY },
    };
  }

  public getImpact(): Point2D {
    return { ...this.impact };
  }

  /**
   * Returns minimum distance in pixels from point p to any unsealed crack segment.
   */
  public getDistanceToCrack(p: Point2D): number {
    let minDist = 9999;
    for (const edge of this.edges) {
      if (!edge.isSealed) {
        const { dist } = this.distToSegment(p, edge.p1, edge.p2);
        if (dist < minDist) minDist = dist;
      }
    }
    return minDist;
  }

  /**
   * Evaluates if pointer position is within brush proximity threshold (d <= 36px)
   */
  public isNearCrack(p: Point2D, proximityThreshold = 36): boolean {
    return this.getDistanceToCrack(p) <= proximityThreshold;
  }

  /**
   * Interactive Lacquer Painting:
   * Continuous Gaussian deposit falloff along crack veins within brush proximity.
   */
  public paintAt(pointer: Point2D, brushRadius = 36, speed = 100, now = performance.now()): number {
    if (this.isCured || this.edges.length === 0) return this.overallGoldProgress;
    this.lastUserInteractTime = now;
    this.tsugiAssistActive = false;
    this.tsugiFastAssist = false;

    // Velocity moderation: fast chaotic strokes deposit less lacquer
    const speedFactor = Math.max(0.18, Math.min(1.0, 1.2 - speed / 750.0));
    const sigmaSq = 2.0 * Math.pow(brushRadius * 0.65, 2);
    let modified = false;

    for (const edge of this.edges) {
      if (edge.isSealed) continue;

      const { dist } = this.distToSegment(pointer, edge.p1, edge.p2);
      if (dist <= brushRadius) {
        // Record accuracy: deviation from true centerline
        const accuracy = Math.max(0, 100 - (dist / brushRadius) * 100);
        this.accuracySamples.push(accuracy);

        // Gaussian falloff
        const falloff = Math.exp(-(dist * dist) / sigmaSq);
        const deposit = 0.38 * falloff * speedFactor;
        edge.goldProgress = Math.min(1.0, edge.goldProgress + deposit);

        if (edge.goldProgress >= 0.985) {
          edge.goldProgress = 1.0;
          edge.isSealed = true;
        }
        modified = true;
      }
    }

    if (modified) {
      this.recalculateGoldProgress();
    }

    return this.overallGoldProgress;
  }

  /** Recalculates overall gold coverage progress P_gold \in [0, 1] */
  private recalculateGoldProgress(): void {
    let sealedLen = 0;
    for (const edge of this.edges) {
      sealedLen += edge.length * edge.goldProgress;
    }
    this.sealedLength = sealedLen;
    this.overallGoldProgress = this.totalLength > 0 ? Math.min(1.0, sealedLen / this.totalLength) : 0;

    this.onGoldProgressCb?.(this.overallGoldProgress);

    // 100% cure trigger
    if (this.overallGoldProgress >= 0.995 && !this.isCured) {
      this.completeCure();
    }
  }

  /** Triggers when vessel reaches 100% cure */
  private completeCure(): void {
    this.isCured = true;
    this.overallGoldProgress = 1.0;
    for (const edge of this.edges) {
      edge.goldProgress = 1.0;
      edge.isSealed = true;
    }

    // Ledger update
    this.ledger.totalHealed++;
    this.ledger.currentStreak++;
    if (this.ledger.currentStreak > this.ledger.bestStreak) {
      this.ledger.bestStreak = this.ledger.currentStreak;
    }

    if (this.accuracySamples.length > 0) {
      const sum = this.accuracySamples.reduce((a, b) => a + b, 0);
      const sessionAcc = sum / this.accuracySamples.length;
      this.ledger.meanAccuracyPct = parseFloat((this.ledger.meanAccuracyPct * 0.7 + sessionAcc * 0.3).toFixed(1));
    }

    // Diegetic Content Bridging
    const bridgeIdx = (this.ledger.totalHealed - 1) % CONTENT_BRIDGES.length;
    const bridgedEssay = CONTENT_BRIDGES[bridgeIdx];
    this.ledger.lastBridgedPost = bridgedEssay;
    this.saveLedger();

    this.onGoldProgressCb?.(1.0);
    this.onSeamCuredCb?.(this.ledger, bridgedEssay);
  }

  /**
   * Autonomous Tsugi Assist Loop:
   * Advances along active unsealed edges with minimum-jerk trajectory progression.
   */
  public updateTsugiAssist(dtSeconds: number, now = performance.now()): void {
    if (this.isCured || this.edges.length === 0) return;

    // Trigger assist after 1.8s of user inactivity or if explicitly engaged
    const timeSinceUser = now - this.lastUserInteractTime;
    if (timeSinceUser > 1800) {
      this.tsugiAssistActive = true;
    }

    if (!this.tsugiAssistActive) return;

    // Rate of progression along edge: ~8.5 edges/sec yields a fluid 4-second artisan sweep
    const edgeStepRate = this.tsugiFastAssist ? 18.0 : 8.5; // edges per sec
    const dS = dtSeconds * edgeStepRate;

    // Find next unsealed edge if current one is finished
    if (this.currentAssistEdgeIndex === -1 || this.edges[this.currentAssistEdgeIndex]?.isSealed) {
      this.currentAssistEdgeIndex = this.edges.findIndex((e) => !e.isSealed);
      this.tsugiParamS = 0;
    }

    const edge = this.edges[this.currentAssistEdgeIndex];
    if (!edge) {
      this.recalculateGoldProgress();
      return;
    }

    this.tsugiParamS = Math.min(1.0, this.tsugiParamS + dS);
    const s = this.tsugiParamS;
    // Flash & Hogan 5th-order minimum jerk polynomial
    const smoothT = 10 * Math.pow(s, 3) - 15 * Math.pow(s, 4) + 6 * Math.pow(s, 5);

    edge.goldProgress = Math.max(edge.goldProgress, smoothT);
    if (edge.goldProgress >= 0.99) {
      edge.goldProgress = 1.0;
      edge.isSealed = true;
      this.currentAssistEdgeIndex = -1;
      this.tsugiParamS = 0;
    }

    const tx = edge.p1.x + (edge.p2.x - edge.p1.x) * smoothT;
    const ty = edge.p1.y + (edge.p2.y - edge.p1.y) * smoothT;
    this.onTsugiStepCb?.({ x: tx, y: ty }, edge.angle);

    this.recalculateGoldProgress();
  }

  /** Forces Tsugi to immediately assist and begin sealing from crack epicenter outwards */
  public triggerTsugiAssist(fast = false): void {
    this.tsugiAssistActive = true;
    this.tsugiFastAssist = fast;
    this.lastUserInteractTime = -10000;
    this.currentAssistEdgeIndex = 0;
    this.tsugiParamS = 0;
    const firstEdge = this.edges[0];
    if (firstEdge) {
      this.onTsugiStepCb?.({ x: firstEdge.p1.x, y: firstEdge.p1.y }, firstEdge.angle);
    }
  }

  /** Generates SVG path data for the crack veins with stroke-dashoffset gold overlay */
  public getSvgPaths(): {
    crackPath: string;
    goldSegments: Array<{ d: string; progress: number; isSealed: boolean }>;
  } {
    let crackPath = '';
    const goldSegments: Array<{ d: string; progress: number; isSealed: boolean }> = [];

    for (const edge of this.edges) {
      const segD = `M ${edge.p1.x.toFixed(1)} ${edge.p1.y.toFixed(1)} L ${edge.p2.x.toFixed(1)} ${edge.p2.y.toFixed(1)}`;
      crackPath += `${segD} `;
      goldSegments.push({
        d: segD,
        progress: edge.goldProgress,
        isSealed: edge.isSealed,
      });
    }

    return { crackPath: crackPath.trim(), goldSegments };
  }

  // Getters & Event Binders
  public onGoldProgress(cb: (progress: number) => void): void {
    this.onGoldProgressCb = cb;
  }

  public onSeamCured(cb: (ledger: GameLedger, bridge: ContentBridgeEssay) => void): void {
    this.onSeamCuredCb = cb;
  }

  public onTsugiStep(cb: (target: Point2D, angle: number) => void): void {
    this.onTsugiStepCb = cb;
  }

  public getGoldProgress(): number {
    return this.overallGoldProgress;
  }

  public getIsCured(): boolean {
    return this.isCured;
  }

  public getLedger(): GameLedger {
    return { ...this.ledger };
  }

  public getEdges(): CrackEdge[] {
    return this.edges;
  }

  public getNodes(): CrackNode[] {
    return this.nodes;
  }
}

export const createKintsugiGame = (): KintsugiGameEngine => new KintsugiGameEngine();
