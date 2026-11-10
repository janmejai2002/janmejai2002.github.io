# Canon: Diegetic Editorial Navigation & Explorable Explanations

## 1. Bret Victor: Explorable Explanations & Active Reading (2011)
*\"Explorable Explanations\", \"Up and Down the Ladder of Abstraction\", and \"A Brief Rant on the Future of Interaction Design\"*

### The Trap of the Passive Metaphor
Bret Victor diagnosed the tragedy of the modern web: computer displays were treated as mere \"pictures of paper\"—static, inert text dumped into scrollable viewports. 
- **Reactive Documents**: In an active medium, text and data models must be intimately bound. If an author discusses a parameters shift (e.g., token throughput, inference cost, Bayesian belief thresholds), the reader should be able to scrub, tap, or fracture the variable and witness the entire model recalculate live in front of them.
- **The Ladder of Abstraction**: Deep engineering comprehension requires moving smoothly between concrete systems data (single transaction logs, individual crack coordinates) and broad architectural abstractions (overall failure modes, Pareto frontiers). Explorable explanations give the reader direct cognitive control over this ladder.
- **Diegetic Interface Elements**: Interface elements should not float in detached foreign chrome (e.g. browser extensions, modal popups, hamburger menus). They should be *diegetic*—belonging organically to the world of the document itself, like figures painted into an ancient scroll or tools laid out on a craftsman's workbench.

---

## 2. Marginalia & The Classical Editorial Architecture of Active Reading
*The Lineage of Scholia, Glosses, and Talmudic Multi-Voice Text*

### Historical Precedent: The Multi-Layered Page
Long before modern web designers invented sidebars, classical scholars and monastic scribes mastered the art of non-linear active reading:
- **Scholia & Marginal Notes**: The primary text occupies the noble central column. In the generous outer margins, generations of commentators, scribes, and readers inscribe glosses, cross-references, refutations, and structural diagrams.
- **Talmudic Layout**: In the traditional Vilna edition of the Talmud, the core text of the Mishnah and Gemara is surrounded concentrically by Rashi's commentary on the inside and the Tosafot on the outside. Different voices converse across centuries within the same spatial field without interrupting the central voice.

### Modern Implementation for wAIbi-sabi: Diegetic Mascot Marginalia
How do Oops, Tsugi, Kiki, Fude, and Uso inhabit an article without cluttering the prose?
1. **Fude's Margin Scribe (The Chronicler)**:
   - When a reader reaches a critical architectural insight or failure analysis, Fude appears quietly in the margin beside the paragraph, dipping his bamboo brush and leaving a crisp summary seal or bookmark.
2. **Kiki's Reading Depth Tracker (The Perched Sentinel)**:
   - Instead of a generic corporate horizontal progress bar across the top of the browser, Kiki is perched on the right-hand margin track, descending gracefully down the margin with feline balance as the user scrolls, curling up into a contented nap when reaching the article postmortem.
3. **Uso's Verification Loupe (The Technical Inspector)**:
   - Beside benchmark tables, mathematical formulas, or latency curves, Uso rests with his magnifying loupe, allowing the reader to click and inspect raw telemetry data, confidence intervals, and test assertions.
4. **Tsugi's Golden Seal (The Postmortem Healer)**:
   - At the culmination of a postmortem essay (the resolution / lessons learned), Tsugi places a glowing Kintsugi lacquer seal, inviting the user to tap and add the lesson to their personal reading chronicle.
5. **Oops's Cautionary Shard (The Honest Apprentice)**:
   - In sections detailing catastrophic mistakes, production outages, or naive assumptions, Oops peeks out with a fractured pottery shard, reminding the reader of the human vulnerability inherent in all engineering.
