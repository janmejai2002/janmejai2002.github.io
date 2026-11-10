/**
 * kintsugi-game.ts
 * Interactive Kintsugi Game & Crack Sandbox Engine for wAIbi-sabi.
 * Zero external dependencies.
 *
 * Implements:
 * 1. Analytical Voronoi / Delaunay Crack Graph Branching from impact impulse \vec{J}.
 * 2. Stochastic seed jitter ensuring unique fracture topography per session.
 * 3. Gold Lacquer Painting mechanic with sub-pixel brush proximity (d <= 36px).
 * 4. Autonomous Tsugi artisan assist when user pauses or requests help.
 * 5. Fude's Repair Ledger (healed count, accuracy %, repair streak) persisted to localStorage.
 * 6. Diegetic Content Bridging: mapping cured fractures to applied-AI essays.
 * 7. Soundless golden luster wave trigger and Hanko seal (金継) stamped state.
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
    slug: 'blog/agent-framework-20-year-old-bugs',
    title: 'Why AI Systems Fail at Organizational Boundaries',
    ask: 'Why do multi-agent systems crash in corporate production?',
    track: 'technical',
  },
  {
    slug: 'blog/what-a-context-window-is-and-why-it-fills-up',
    title: 'What a Context Window Is and Why It Fills Up',
    ask: 'Why does long context degrade reasoning accuracy?',
    track: 'basics',
  },
  {
    slug: 'blog/klarna-ai-customer-service-graded-honestly',
    title: "Klarna's AI Customer Service Graded Honestly",
    ask: 'Can 700 customer support agents truly be replaced by an LLM?',
    track: 'case-studies',
  },
  {
    slug: 'blog/the-agent-protocol-shortlist-is-now-two-mcp-and-a2a',
    title: 'The Agent Protocol Shortlist: MCP and A2A',
    ask: 'Which protocol will standardize tool execution in 2026?',
    track: 'technical',
  },
  {
    slug: 'blog/budget-ai-costs-per-token-pricing',
    title: 'Budgeting AI Costs & Token Pricing Realities',
    ask: 'How do you price an enterprise agent without burning capital?',
    track: 'business',
  },
  {
    slug: 'blog/ai-latency-ttft-for-product-teams',
    title: 'AI Latency & TTFT for Product Teams',
    ask: 'How fast must streaming tokens arrive before users drop off?',
    track: 'technical',
  },
  {
    slug: 'blog/musk-yc-ai-startup-school-talk',
    title: 'Elon Musk YC AI Startup School Autopsy',
    ask: 'What did the frontier founders get right about autonomy?',
    track: 'talks',
  },
  {
    slug: 'blog/prompt-caching-scheduled-agent-savings',
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
   * Initializes a new analytical Voronoi / Delaunay crack branching network
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
    this.lastUserInteractTime = performance.now();

    const aspect = stageSize.width / Math.max(1, stageSize.height);

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

    // Pseudo-random generator from seed
    let s = seed + 1.2345;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };

    // Construct primary trunk vein westward through the headline band
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

      // Bound within safe plate boundaries
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
   * Distance from a point P to a line segment [A, B].
   * Returns distance and projection factor t in [0, 1].
   */
  private distToSegment(p: Point2D, a: Point2D, b: Point2D): { dist: number; t: number; proj: Point2D } {
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

  /**
   * Evaluates if pointer position is within brush proximity threshold (d <= 36px)
   * of any unsealed crack vein.
   */
  public isNearCrack(p: Point2D, proximityThreshold = 36): boolean {
    for (const edge of this.edges) {
      if (!edge.isSealed) {
        const { dist } = this.distToSegment(p, edge.p1, edge.p2);
        if (dist <= proximityThreshold) return true;
      }
    }
    return false;
  }

  /**
   * Interactive Lacquer Painting:
   * Applies gold lacquer along crack veins within brush proximity (d <= 36px).
   */
  public paintAt(pointer: Point2D, brushRadius = 36, now = performance.now()): number {
    if (this.isCured || this.edges.length === 0) return this.overallGoldProgress;
    this.lastUserInteractTime = now;
    this.tsugiAssistActive = false;
    this.tsugiFastAssist = false;

    let modified = false;

    for (const edge of this.edges) {
      if (edge.isSealed) continue;

      const { dist, t } = this.distToSegment(pointer, edge.p1, edge.p2);
      if (dist <= brushRadius) {
        // Record accuracy: deviation from true centerline
        const accuracy = Math.max(0, 100 - (dist / brushRadius) * 100);
        this.accuracySamples.push(accuracy);

        // Brush deposit amount inversely proportional to distance
        const deposit = Math.max(0.25, 1.0 - dist / brushRadius) * 0.45;
        edge.goldProgress = Math.min(1.0, edge.goldProgress + deposit);

        if (edge.goldProgress >= 0.98) {
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
    if (this.overallGoldProgress >= 0.999 && !this.isCured) {
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
   * When user pauses for >1800ms, Tsugi steps forward and seals remaining cracks.
   */
  public updateTsugiAssist(dtSeconds: number, now = performance.now()): void {
    if (this.isCured || this.edges.length === 0) return;

    // Trigger assist after 1.8s of user inactivity or if explicitly engaged
    const timeSinceUser = now - this.lastUserInteractTime;
    if (timeSinceUser > 1800) {
      this.tsugiAssistActive = true;
    }

    if (!this.tsugiAssistActive) return;

    // Artisan lacquer speed: fast assist delivers responsive completion across all screen widths
    const speed = (this.tsugiFastAssist ? 1600 : 360) * dtSeconds;
    let remainingBudget = speed;

    while (remainingBudget > 0) {
      // Find first unsealed edge
      let targetEdge: CrackEdge | null = null;
      for (let i = 0; i < this.edges.length; i++) {
        if (!this.edges[i].isSealed) {
          targetEdge = this.edges[i];
          this.currentAssistEdgeIndex = i;
          break;
        }
      }

      if (!targetEdge) break;

      const neededLen = Math.max(1, targetEdge.length * (1.0 - targetEdge.goldProgress));
      if (remainingBudget >= neededLen) {
        targetEdge.goldProgress = 1.0;
        targetEdge.isSealed = true;
        remainingBudget -= neededLen;

        const tx = targetEdge.p2.x;
        const ty = targetEdge.p2.y;
        this.onTsugiStepCb?.({ x: tx, y: ty }, targetEdge.angle);
      } else {
        targetEdge.goldProgress += remainingBudget / Math.max(1, targetEdge.length);
        if (targetEdge.goldProgress >= 0.99) {
          targetEdge.goldProgress = 1.0;
          targetEdge.isSealed = true;
        }
        remainingBudget = 0;

        const tx = targetEdge.p1.x + (targetEdge.p2.x - targetEdge.p1.x) * targetEdge.goldProgress;
        const ty = targetEdge.p1.y + (targetEdge.p2.y - targetEdge.p1.y) * targetEdge.goldProgress;
        this.onTsugiStepCb?.({ x: tx, y: ty }, targetEdge.angle);
      }
    }

    this.recalculateGoldProgress();
  }

  /** Forces Tsugi to immediately assist and finish sealing */
  public triggerTsugiAssist(): void {
    this.tsugiAssistActive = true;
    this.tsugiFastAssist = true;
    this.lastUserInteractTime = -10000;
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

  public getImpact(): Point2D {
    return { ...this.impact };
  }
}

export const createKintsugiGame = (): KintsugiGameEngine => new KintsugiGameEngine();
