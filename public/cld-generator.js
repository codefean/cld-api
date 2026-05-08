/*
  CLD Generator Embed
  Usage:
    <script src="/cld-generator.js"></script>
    <cld-diagram src="/cld.csv" diagram="forest dieoff" downloads="svg,csv,txt"></cld-diagram>
*/

(function () {
  "use strict";

  function loadD3() {
    return new Promise((resolve, reject) => {
      if (window.d3) {
        resolve(window.d3);
        return;
      }

      const existing = document.querySelector('script[data-cld-d3-loader="true"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.d3));
        existing.addEventListener("error", () => reject(new Error("Failed to load D3.")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";
      script.async = true;
      script.dataset.cldD3Loader = "true";
      script.onload = () => resolve(window.d3);
      script.onerror = () => reject(new Error("Failed to load D3."));
      document.head.appendChild(script);
    });
  }

  async function loadCSV(url) {
    const res = await fetch(url, { credentials: "same-origin" });

    if (!res.ok) {
      throw new Error(`Could not load CSV: ${url}`);
    }

    const text = await res.text();
    return parseCSV(text);
  }

  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    text = String(text || "").replace(/^\uFEFF/, "");

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i++;
        row.push(cell.trim());
        cell = "";

        if (row.some(Boolean)) rows.push(row);
        row = [];
      } else {
        cell += char;
      }
    }

    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);

    if (rows.length === 0) return [];

    const headers = rows.shift().map((h) => h.trim().toLowerCase());

    return rows.map((values) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || "";
      });
      return obj;
    });
  }

  function rowsToEdges(rows, diagramName) {
    const wanted = normalizeName(diagramName);

    return rows
      .filter((row) => normalizeName(row.diagram) === wanted)
      .map((row) => ({
        source: row.from || row.source || "",
        target: row.to || row.target || "",
        polarity: row.polarity === "-" ? "-" : "+",
      }))
      .filter((edge) => edge.source && edge.target);
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function findLoops(edges) {
    const adj = new Map();
    edges.forEach((e) => {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source).push({ target: e.target, polarity: e.polarity });
    });

    const cycles = [];
    const seen = new Set();

    function dfs(start, current, path, polarities, visited) {
      const neighbors = adj.get(current) || [];
      for (const { target, polarity } of neighbors) {
        if (target === start && path.length > 0) {
          const cyc = [...path, start];
          const pols = [...polarities, polarity];
          const minIdx = cyc.slice(0, -1).reduce(
            (mi, n, i, a) => (n < a[mi] ? i : mi),
            0
          );
          const rotatedNodes = [...cyc.slice(minIdx, -1), ...cyc.slice(0, minIdx)];
          const rotatedPols = [...pols.slice(minIdx), ...pols.slice(0, minIdx)];
          const key = rotatedNodes.join("→") + "|" + rotatedPols.join("");
          if (!seen.has(key)) {
            seen.add(key);
            const negCount = rotatedPols.filter((p) => p === "-").length;
            cycles.push({
              nodes: rotatedNodes,
              polarities: rotatedPols,
              type: negCount % 2 === 0 ? "R" : "B",
            });
          }
        } else if (!visited.has(target)) {
          visited.add(target);
          dfs(start, target, [...path, current], [...polarities, polarity], visited);
          visited.delete(target);
        }
      }
    }

    const allNodes = new Set();
    edges.forEach((e) => {
      allNodes.add(e.source);
      allNodes.add(e.target);
    });

    for (const n of allNodes) {
      dfs(n, n, [], [], new Set([n]));
    }

    return cycles.filter((c) => c.nodes.length <= 8);
  }

  function buildLoopReport(edges, loops) {
    const nodes = new Set();
    edges.forEach((e) => {
      nodes.add(e.source);
      nodes.add(e.target);
    });

    const lines = [];
    lines.push("CAUSAL LOOP DIAGRAM");
    lines.push("===================");
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Variables: ${nodes.size}`);
    lines.push(`Links: ${edges.length}`);

    const rCount = loops.filter((l) => l.type === "R").length;
    const bCount = loops.filter((l) => l.type === "B").length;

    lines.push(`Feedback loops: ${loops.length} (${rCount} reinforcing, ${bCount} balancing)`);
    lines.push("");
    lines.push("VARIABLES");
    lines.push("---------");
    Array.from(nodes).sort().forEach((n) => lines.push(`  ${n}`));
    lines.push("");
    lines.push("LINKS");
    lines.push("-----");
    edges.forEach((e) => lines.push(`  ${e.source} --(${e.polarity})--> ${e.target}`));
    lines.push("");
    lines.push("FEEDBACK LOOPS");
    lines.push("--------------");

    if (loops.length === 0) {
      lines.push("  (none detected)");
    } else {
      loops.forEach((loop, i) => {
        const label = loop.type === "R" ? "REINFORCING" : "BALANCING";
        const negCount = loop.polarities.filter((p) => p === "-").length;
        lines.push(`Loop ${i + 1} [${loop.type}] — ${label}`);
        lines.push(`  Length: ${loop.nodes.length} variables, ${negCount} negative link${negCount === 1 ? "" : "s"}`);
        const path = loop.nodes.map((n, j) => `${n} --(${loop.polarities[j]})-->`).join(" ");
        lines.push(`  Path:   ${path} ${loop.nodes[0]}`);
        lines.push("");
      });
    }

    return lines.join("\n");
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function serializeSvg(svgNode) {
    if (!svgNode) return null;

    const clone = svgNode.cloneNode(true);

    const width = Number(svgNode.getAttribute("width")) || svgNode.clientWidth || 900;
    const height = Number(svgNode.getAttribute("height")) || svgNode.clientHeight || 500;

    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", width);
    clone.setAttribute("height", height);
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", "0");
    bg.setAttribute("y", "0");
    bg.setAttribute("width", "100%");
    bg.setAttribute("height", "100%");
    bg.setAttribute("fill", "#fafaf9");
    clone.insertBefore(bg, clone.firstChild);

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clone);

    if (!source.startsWith("<?xml")) {
      source = `<?xml version="1.0" encoding="UTF-8"?>\n${source}`;
    }

    return source;
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(value) {
    return String(value || "cld")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "cld";
  }

  function csvEscape(value) {
    const s = String(value ?? "");
    const escaped = s.replace(/"/g, '""');
    return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
  }

  function renderD3Diagram(svgNode, edges, options = {}) {
    const d3 = options.d3 || window.d3;
    const height = Number(options.height) || 500;
    const width = Math.max(320, svgNode.parentElement?.clientWidth || svgNode.clientWidth || 900);
    const isMobile = width < 640;

    svgNode.setAttribute("width", width);
    svgNode.setAttribute("height", height);
    svgNode.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const svg = d3.select(svgNode);
    svg.selectAll("*").remove();

    const nodeMap = new Map();
    edges.forEach((e) => {
      if (!nodeMap.has(e.source)) nodeMap.set(e.source, { id: e.source });
      if (!nodeMap.has(e.target)) nodeMap.set(e.target, { id: e.target });
    });

    const nodes = Array.from(nodeMap.values());
    const links = edges.map((e, i) => ({
      source: e.source,
      target: e.target,
      polarity: e.polarity,
      idx: i,
    }));

    const pairKey = (a, b) => [a, b].sort().join("|");
    const linkGroups = new Map();

    links.forEach((l) => {
      const k = pairKey(l.source, l.target);
      if (!linkGroups.has(k)) linkGroups.set(k, []);
      linkGroups.get(k).push(l);
    });

    links.forEach((l) => {
      const group = linkGroups.get(pairKey(l.source, l.target));
      const total = group.length;
      if (total === 1) {
        l._curve = 0;
      } else {
        const idxInGroup = group.indexOf(l);
        const direction = l.source < l.target ? 1 : -1;
        l._curve = (idxInGroup - (total - 1) / 2) * 0.6 * direction;
      }
    });

    const uid = `cld-${Math.random().toString(36).slice(2)}`;
    const arrowPosId = `${uid}-arrow-pos`;
    const arrowNegId = `${uid}-arrow-neg`;

    const defs = svg.append("defs");

    const makeMarker = (id, color) => {
      defs.append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 9)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    };

    makeMarker(arrowPosId, "#0f766e");
    makeMarker(arrowNegId, "#b91c1c");

    const g = svg.append("g");

    svg.call(
      d3.zoom()
        .scaleExtent([0.3, 3])
        .filter((event) => !event.button && !event.target.closest(".cld-node"))
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    const linkSel = g.append("g")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d) => (d.polarity === "+" ? "#0f766e" : "#b91c1c"))
      .attr("stroke-width", isMobile ? 1.8 : 1.6)
      .attr("marker-end", (d) =>
        d.polarity === "+" ? `url(#${arrowPosId})` : `url(#${arrowNegId})`
      )
      .attr("opacity", 0.9);

    const labelSel = g.append("g")
      .selectAll("g")
      .data(links)
      .join("g");

    const labelR = isMobile ? 10 : 9;

    labelSel.append("circle")
      .attr("r", labelR)
      .attr("fill", "#ffffff")
      .attr("stroke", (d) => (d.polarity === "+" ? "#0f766e" : "#b91c1c"))
      .attr("stroke-width", 1.2);

    labelSel.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", isMobile ? 13 : 12)
      .attr("font-weight", 600)
      .attr("fill", (d) => (d.polarity === "+" ? "#0f766e" : "#b91c1c"))
      .text((d) => d.polarity);

    const nodeG = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "cld-node")
      .style("cursor", "grab")
      .call(
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const measureFontSize = isMobile ? 14 : 13;
    const measure = svg.append("text")
      .attr("visibility", "hidden")
      .attr("font-size", measureFontSize)
      .attr("font-family", "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif");

    nodes.forEach((n) => {
      measure.text(n.id);
      n._w = Math.max(isMobile ? 70 : 64, measure.node().getComputedTextLength() + (isMobile ? 28 : 24));
      n._h = isMobile ? 36 : 32;
    });

    measure.remove();

    nodeG.append("rect")
      .attr("x", (d) => -d._w / 2)
      .attr("y", (d) => -d._h / 2)
      .attr("width", (d) => d._w)
      .attr("height", (d) => d._h)
      .attr("rx", 16)
      .attr("ry", 16)
      .attr("fill", "#ffffff")
      .attr("stroke", "#171717")
      .attr("stroke-width", 1);

    nodeG.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", measureFontSize)
      .attr("font-weight", 450)
      .attr("fill", "#171717")
      .attr("pointer-events", "none")
      .text((d) => d.id);

    const linkDist = isMobile ? 130 : 170;
    const charge = isMobile ? -520 : -720;
    const collide = isMobile ? 56 : 72;

    const sim = d3
      .forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d) => d.id).distance(linkDist).strength(0.4))
      .force("charge", d3.forceManyBody().strength(charge))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(collide));

    function pathFor(d) {
      const sx = d.source.x;
      const sy = d.source.y;
      const tx = d.target.x;
      const ty = d.target.y;
      const dx = tx - sx;
      const dy = ty - sy;
      const dr = Math.sqrt(dx * dx + dy * dy) || 1;

      const trim = (cx, cy, ww, hh, fromX, fromY) => {
        const ddx = fromX - cx;
        const ddy = fromY - cy;
        const ax = Math.abs(ddx);
        const ay = Math.abs(ddy);
        const sxr = ww / 2;
        const syr = hh / 2;
        const scale = (ax / sxr > ay / syr) ? sxr / ax : syr / ay;
        return [cx + ddx * scale, cy + ddy * scale];
      };

      const [sxT, syT] = trim(sx, sy, d.source._w, d.source._h, tx, ty);
      const [txT, tyT] = trim(tx, ty, d.target._w + 8, d.target._h + 8, sx, sy);

      if (Math.abs(d._curve) < 0.001) {
        return `M${sxT},${syT}L${txT},${tyT}`;
      }

      const mx = (sxT + txT) / 2;
      const my = (syT + tyT) / 2;
      const nx = -(tyT - syT);
      const ny = txT - sxT;
      const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
      const cx = mx + (nx / nlen) * dr * d._curve * 0.4;
      const cy = my + (ny / nlen) * dr * d._curve * 0.4;

      return `M${sxT},${syT}Q${cx},${cy} ${txT},${tyT}`;
    }

    sim.on("tick", () => {
      nodes.forEach((n) => {
        n.x = Math.max(n._w / 2 + 4, Math.min(width - n._w / 2 - 4, n.x));
        n.y = Math.max(n._h / 2 + 4, Math.min(height - n._h / 2 - 4, n.y));
      });

      linkSel.attr("d", pathFor);

      labelSel.attr("transform", (d) => {
        const sx = d.source.x;
        const sy = d.source.y;
        const tx = d.target.x;
        const ty = d.target.y;
        const mx = (sx + tx) / 2;
        const my = (sy + ty) / 2;

        if (Math.abs(d._curve) < 0.001) {
          return `translate(${mx},${my})`;
        }

        const nx = -(ty - sy);
        const ny = tx - sx;
        const nlen = Math.sqrt(nx * nx + ny * ny) || 1;
        const dr = Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2);

        return `translate(${mx + (nx / nlen) * dr * d._curve * 0.2},${my + (ny / nlen) * dr * d._curve * 0.2})`;
      });

      nodeG.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return {
      stop() {
        sim.stop();
      },
      resize(newHeight) {
        return renderD3Diagram(svgNode, edges, { ...options, height: newHeight || height });
      },
    };
  }

  class CLDDiagramElement extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.edges = [];
      this.loops = [];
      this.svg = null;
      this.renderer = null;
      this._renderToken = 0;
    }

    static get observedAttributes() {
      return ["src", "diagram", "height", "downloads"];
    }

    connectedCallback() {
      this.render();
    }

    disconnectedCallback() {
      if (this.renderer && typeof this.renderer.stop === "function") {
        this.renderer.stop();
      }
    }

    attributeChangedCallback() {
      if (this.isConnected) {
        this.render();
      }
    }

    async render() {
      const token = ++this._renderToken;
      const src = this.getAttribute("src");
      const diagram = this.getAttribute("diagram");
      const height = Number(this.getAttribute("height")) || 500;
      const downloadsAttr = this.getAttribute("downloads");
      const downloads = downloadsAttr === null ? "svg,csv,txt" : downloadsAttr;

      if (!src || !diagram) {
        this.renderError("Missing src or diagram attribute.");
        return;
      }

      if (this.renderer && typeof this.renderer.stop === "function") {
        this.renderer.stop();
        this.renderer = null;
      }

      this.shadowRoot.innerHTML = this.baseHTML(height, diagram);

      try {
        const [d3, rows] = await Promise.all([
          loadD3(),
          loadCSV(src),
        ]);

        if (token !== this._renderToken) return;

        this.edges = rowsToEdges(rows, diagram);
        this.loops = findLoops(this.edges);

        if (this.edges.length === 0) {
          this.renderError(`No CLD found for "${diagram}". Check the diagram column in ${src}.`);
          return;
        }

        const svg = this.shadowRoot.querySelector("svg");
        this.svg = svg;

        this.renderer = renderD3Diagram(svg, this.edges, {
          d3,
          height,
        });

        this.renderStats(diagram);
        this.renderDownloadButtons(downloads, diagram);
      } catch (err) {
        if (token !== this._renderToken) return;
        this.renderError(err && err.message ? err.message : String(err));
      }
    }

    baseHTML(height, diagram) {
      return `
        <style>
          :host {
            display: block;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            color: #171717;
          }

          * {
            box-sizing: border-box;
          }

          .cld-shell {
            border: 1px solid #e7e5e4;
            border-radius: 6px;
            overflow: hidden;
            background: #ffffff;
          }

          .cld-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-bottom: 1px solid #e7e5e4;
            background: #ffffff;
          }

          .cld-heading {
            min-width: 0;
          }

          .cld-title {
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #78716c;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .cld-stats {
            margin-top: 2px;
            font-size: 12px;
            color: #a8a29e;
          }

          .cld-downloads {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .cld-downloads button {
            font: inherit;
            font-size: 12px;
            padding: 5px 8px;
            border: 1px solid #d6d3d1;
            background: #ffffff;
            border-radius: 4px;
            cursor: pointer;
            color: #292524;
          }

          .cld-downloads button:hover {
            border-color: #171717;
          }

          svg {
            display: block;
            width: 100%;
            height: ${height}px;
            background: #fafaf9;
            touch-action: none;
          }

          .cld-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            padding: 8px 12px 10px;
            font-size: 12px;
            color: #78716c;
            border-top: 1px solid #e7e5e4;
          }

          .cld-legend-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }

          .cld-line {
            width: 14px;
            height: 1px;
            display: inline-block;
          }

          .cld-error {
            padding: 16px;
            font-size: 14px;
            color: #b91c1c;
            border: 1px solid #fecaca;
            background: #fef2f2;
            border-radius: 6px;
          }

          @media (max-width: 640px) {
            .cld-toolbar {
              align-items: flex-start;
              flex-direction: column;
            }

            .cld-downloads {
              justify-content: flex-start;
            }
          }
        </style>

        <div class="cld-shell">
          <div class="cld-toolbar">
            <div class="cld-heading">
              <div class="cld-title">${escapeHTML(diagram)}</div>
              <div class="cld-stats">Loading…</div>
            </div>
            <div class="cld-downloads"></div>
          </div>

          <svg width="900" height="${height}" aria-label="${escapeHTML(diagram)} causal loop diagram" role="img"></svg>

          <div class="cld-legend">
            <span class="cld-legend-item">
              <span class="cld-line" style="background:#0f766e"></span>
              <span style="color:#0f766e">+</span>
              <span>positive link</span>
            </span>
            <span class="cld-legend-item">
              <span class="cld-line" style="background:#b91c1c"></span>
              <span style="color:#b91c1c">−</span>
              <span>negative link</span>
            </span>
          </div>
        </div>
      `;
    }

    renderStats() {
      const stats = this.shadowRoot.querySelector(".cld-stats");
      if (!stats) return;

      const nodes = new Set();
      this.edges.forEach((e) => {
        nodes.add(e.source);
        nodes.add(e.target);
      });

      const rCount = this.loops.filter((l) => l.type === "R").length;
      const bCount = this.loops.filter((l) => l.type === "B").length;

      stats.textContent = `${nodes.size} variables · ${this.edges.length} links · ${rCount} R-loops · ${bCount} B-loops`;
    }

    renderDownloadButtons(downloads, diagram) {
      const container = this.shadowRoot.querySelector(".cld-downloads");
      if (!container) return;

      container.innerHTML = "";

      const allowed = String(downloads || "")
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);

      if (allowed.length === 0) return;

      if (allowed.includes("svg")) {
        container.appendChild(this.makeButton("SVG", () => this.downloadSVG(diagram)));
      }

      if (allowed.includes("csv")) {
        container.appendChild(this.makeButton("CSV", () => this.downloadCSV(diagram)));
      }

      if (allowed.includes("txt")) {
        container.appendChild(this.makeButton("TXT", () => this.downloadTXT(diagram)));
      }
    }

    makeButton(label, onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", onClick);
      return button;
    }

    downloadSVG(diagram) {
      const svgText = serializeSvg(this.svg);
      if (!svgText) return;

      downloadBlob(
        new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
        `${slugify(diagram)}.svg`
      );
    }

    downloadCSV(diagram) {
      const rows = [
        "diagram,from,to,polarity",
        ...this.edges.map((e) => [
          csvEscape(diagram),
          csvEscape(e.source),
          csvEscape(e.target),
          csvEscape(e.polarity),
        ].join(",")),
      ];

      downloadBlob(
        new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" }),
        `${slugify(diagram)}.csv`
      );
    }

    downloadTXT(diagram) {
      const txt = buildLoopReport(this.edges, this.loops);

      downloadBlob(
        new Blob([txt], { type: "text/plain;charset=utf-8" }),
        `${slugify(diagram)}-loops.txt`
      );
    }

    renderError(message) {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: ui-sans-serif, system-ui, sans-serif;
          }

          .cld-error {
            padding: 16px;
            font-size: 14px;
            color: #b91c1c;
            border: 1px solid #fecaca;
            background: #fef2f2;
            border-radius: 6px;
          }
        </style>

        <div class="cld-error">${escapeHTML(message)}</div>
      `;
    }
  }

  if (!customElements.get("cld-diagram")) {
    customElements.define("cld-diagram", CLDDiagramElement);
  }

  window.CLDGenerator = {
    render(options = {}) {
      const container =
        typeof options.container === "string"
          ? document.querySelector(options.container)
          : options.container;

      if (!container) {
        throw new Error("CLDGenerator.render: container not found.");
      }

      const el = document.createElement("cld-diagram");

      const src = options.dataUrl || options.src;
      if (src) el.setAttribute("src", src);
      if (options.diagram) el.setAttribute("diagram", options.diagram);
      if (options.height) el.setAttribute("height", String(options.height));

      if (options.downloads === false || options.allowDownload === false) {
        el.setAttribute("downloads", "");
      } else if (Array.isArray(options.exports)) {
        el.setAttribute("downloads", options.exports.join(","));
      } else if (Array.isArray(options.downloads)) {
        el.setAttribute("downloads", options.downloads.join(","));
      } else if (typeof options.downloads === "string") {
        el.setAttribute("downloads", options.downloads);
      }

      container.innerHTML = "";
      container.appendChild(el);

      return el;
    },

    renderAll() {
      document.querySelectorAll("[data-cld]").forEach((node) => {
        const el = document.createElement("cld-diagram");

        if (node.dataset.src) el.setAttribute("src", node.dataset.src);
        if (node.dataset.diagram) el.setAttribute("diagram", node.dataset.diagram);
        if (node.dataset.height) el.setAttribute("height", node.dataset.height);
        if (node.dataset.downloads !== undefined) {
          el.setAttribute("downloads", node.dataset.downloads);
        }

        node.innerHTML = "";
        node.appendChild(el);
      });
    },

    parseCSV,
    rowsToEdges,
    findLoops,
    renderD3Diagram,
  };
})();
