# CLD API / Embeddable Causal Loop Diagram Generator

CLD API lets you embed interactive **causal loop diagrams (CLDs)** on any webpage using a simple CSV file and one script tag.

Use it to add CLDs to websites, documentation pages, course pages, blogs, public reports, dashboards, or teaching materials.

The hosted script registers a custom HTML element:

```html
<cld-diagram></cld-diagram>
```

Once added to a page, the element loads CLD data from a CSV file, filters for the requested diagram, renders an interactive causal loop diagram, and optionally lets users download the diagram as SVG, CSV, or TXT.

No backend setup is required. The renderer runs in the browser and loads the CSV file directly.

---

## Live script

```html
<script src="https://cld-api.onrender.com/cld-generator.js"></script>
```

---

## Quick start

Add this to any HTML page:

```html
<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<cld-diagram
  src="https://cld-api.onrender.com/cld.csv"
  diagram="forest dieoff"
  height="520"
  downloads="svg,csv,txt">
</cld-diagram>
```

This loads the sample CSV hosted with the API and renders the diagram named `forest dieoff`.

---

## Recommended use: host your own CSV file

Most websites should host their own `cld.csv` file and use the shared CLD renderer script.

In this setup:

* The JavaScript renderer is loaded from `https://cld-api.onrender.com/cld-generator.js`
* Your CLD data is stored in a CSV file on your own website
* The `<cld-diagram>` element loads that CSV and renders the requested diagram

For example, place a CSV file in your website's public folder:

```text
public/
  cld.csv
  index.html
```

Then embed a diagram like this:

```html
<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  height="520"
  downloads="svg,csv,txt">
</cld-diagram>
```

This lets each website control its own CLD data while using the shared renderer.

---

## CSV format

Create a CSV file with these columns:

```csv
diagram,from,to,polarity
forest dieoff,Drought,Tree Stress,+
forest dieoff,Tree Stress,Tree Mortality,+
forest dieoff,Tree Mortality,Canopy Cover,-
forest dieoff,Canopy Cover,Soil Moisture,+
forest dieoff,Soil Moisture,Drought,-
```

Required columns:

| Column     | Description                     |
| ---------- | ------------------------------- |
| `diagram`  | Name of the causal loop diagram |
| `from`     | Source variable                 |
| `to`       | Target variable                 |
| `polarity` | `+` or `-`                      |

One CSV file can contain multiple diagrams:

```csv
diagram,from,to,polarity
forest dieoff,Drought,Tree Stress,+
forest dieoff,Tree Stress,Tree Mortality,+
bank run,Concern,Withdrawals,+
bank run,Withdrawals,Bank Reserves,-
bank run,Bank Reserves,Concern,-
```

Then choose which diagram to render:

```html
<cld-diagram src="/cld.csv" diagram="bank run"></cld-diagram>
```

The value in the `diagram` attribute must match the value in the CSV's `diagram` column.

---

## Basic embed

```html
<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff">
</cld-diagram>
```

---

## Embed with downloads

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  downloads="svg,csv,txt">
</cld-diagram>
```

Available download types:

| Type  | Description                         |
| ----- | ----------------------------------- |
| `svg` | Vector image of the current diagram |
| `csv` | CSV export of the selected diagram  |
| `txt` | Plain text loop report              |

To disable downloads:

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  downloads="">
</cld-diagram>
```

---

## Custom height

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  height="600">
</cld-diagram>
```

If no height is provided, the default is `500`.

---

## Customizing appearance

You can customize how a diagram appears using HTML attributes.

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  height="520"
  theme="dark"
  title="Forest Dieoff System"
  background-color="#0f172a"
  node-color="#1e293b"
  node-border-color="#e2e8f0"
  text-color="#f8fafc"
  positive-color="#22c55e"
  negative-color="#ef4444"
  downloads="svg,csv,txt">
</cld-diagram>
```

### Themes

Use the `theme` attribute to choose a preset style:

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  theme="light">
</cld-diagram>
```

Available themes:

| Theme     | Description                    |
| --------- | ------------------------------ |
| `light`   | Default light theme            |
| `dark`    | Dark background and light text |
| `minimal` | Simple black-and-white style   |

### Hide toolbar, legend, or stats

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  show-toolbar="false"
  show-legend="false"
  show-stats="false">
</cld-diagram>
```

| Attribute      | Description                                              |
| -------------- | -------------------------------------------------------- |
| `show-toolbar` | Set to `false` to hide the top toolbar                   |
| `show-legend`  | Set to `false` to hide the legend below the diagram      |
| `show-stats`   | Set to `false` to hide variables, links, and loop counts |

### Disable interaction

By default, users can drag nodes and zoom or pan the diagram.

To render a non-interactive diagram:

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  interactive="false">
</cld-diagram>
```

This is useful for reports, static pages, or dashboards where accidental dragging or zooming is not desired.

### Color customization

```html
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  background-color="#f8fafc"
  panel-background="#ffffff"
  border-color="#e5e7eb"
  text-color="#111827"
  muted-color="#6b7280"
  node-color="#ffffff"
  node-border-color="#111827"
  positive-color="#059669"
  negative-color="#dc2626"
  button-background="#ffffff"
  button-text-color="#111827"
  radius="12px">
</cld-diagram>
```

| Attribute           | Description                       |
| ------------------- | --------------------------------- |
| `background-color`  | Diagram canvas background         |
| `panel-background`  | Toolbar and legend background     |
| `border-color`      | Outer border and divider color    |
| `text-color`        | Main text and node label color    |
| `muted-color`       | Title and legend text color       |
| `subtle-color`      | Stats text color                  |
| `node-color`        | Node fill color                   |
| `node-border-color` | Node border color                 |
| `positive-color`    | Positive link and `+` label color |
| `negative-color`    | Negative link and `-` label color |
| `button-background` | Download button background        |
| `button-text-color` | Download button text color        |
| `radius`            | Outer border radius               |

---

## Multiple diagrams on one page

```html
<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<h2>Forest Dieoff</h2>
<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  height="520"
  downloads="svg,csv,txt">
</cld-diagram>

<h2>Bank Run</h2>
<cld-diagram
  src="/cld.csv"
  diagram="bank run"
  height="480"
  theme="minimal"
  downloads="svg,csv,txt">
</cld-diagram>
```

---

## Programmatic JavaScript API

You can also render a diagram using JavaScript.

```html
<div id="my-cld"></div>

<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<script>
  CLDGenerator.render({
    container: "#my-cld",
    dataUrl: "/cld.csv",
    diagram: "forest dieoff",
    height: 520,
    downloads: ["svg", "csv", "txt"]
  });
</script>
```

### Programmatic styling

```html
<div id="my-cld"></div>

<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<script>
  CLDGenerator.render({
    container: "#my-cld",
    dataUrl: "/cld.csv",
    diagram: "forest dieoff",
    height: 520,
    theme: "dark",
    title: "Forest Dieoff System",
    backgroundColor: "#0f172a",
    nodeColor: "#1e293b",
    nodeBorderColor: "#e2e8f0",
    textColor: "#f8fafc",
    positiveColor: "#22c55e",
    negativeColor: "#ef4444",
    downloads: ["svg", "csv"]
  });
</script>
```

---

## Auto-render with data attributes

You can mark containers with `data-cld` and call `CLDGenerator.renderAll()`.

```html
<div
  data-cld
  data-src="/cld.csv"
  data-diagram="forest dieoff"
  data-height="520"
  data-downloads="svg,csv,txt">
</div>

<div
  data-cld
  data-src="/cld.csv"
  data-diagram="bank run"
  data-height="480"
  data-theme="dark"
  data-title="Bank Run System"
  data-positive-color="#22c55e"
  data-negative-color="#ef4444"
  data-downloads="svg,csv,txt">
</div>

<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<script>
  CLDGenerator.renderAll();
</script>
```

---

## Attribute reference

| Attribute           | Required | Example                | Description                                      |
| ------------------- | -------: | ---------------------- | ------------------------------------------------ |
| `src`               |      Yes | `/cld.csv`             | Path or URL to the CSV file                      |
| `diagram`           |      Yes | `forest dieoff`        | Diagram name to render                           |
| `height`            |       No | `520`                  | Diagram height in pixels                         |
| `downloads`         |       No | `svg,csv,txt`          | Comma-separated export options                   |
| `theme`             |       No | `dark`                 | Preset theme: `light`, `dark`, or `minimal`      |
| `title`             |       No | `Forest Dieoff System` | Custom title shown in the toolbar                |
| `show-toolbar`      |       No | `false`                | Hide or show the toolbar                         |
| `show-legend`       |       No | `false`                | Hide or show the legend                          |
| `show-stats`        |       No | `false`                | Hide or show diagram stats                       |
| `interactive`       |       No | `false`                | Enable or disable dragging, zooming, and panning |
| `background-color`  |       No | `#f8fafc`              | Diagram canvas background                        |
| `panel-background`  |       No | `#ffffff`              | Toolbar and legend background                    |
| `border-color`      |       No | `#e5e7eb`              | Border and divider color                         |
| `text-color`        |       No | `#111827`              | Main text and node label color                   |
| `muted-color`       |       No | `#6b7280`              | Muted text color                                 |
| `subtle-color`      |       No | `#9ca3af`              | Stats text color                                 |
| `node-color`        |       No | `#ffffff`              | Node fill color                                  |
| `node-border-color` |       No | `#111827`              | Node border color                                |
| `positive-color`    |       No | `#059669`              | Positive link color                              |
| `negative-color`    |       No | `#dc2626`              | Negative link color                              |
| `button-background` |       No | `#ffffff`              | Download button background                       |
| `button-text-color` |       No | `#111827`              | Download button text color                       |
| `radius`            |       No | `12px`                 | Outer border radius                              |

---

## JavaScript API reference

### `CLDGenerator.render(options)`

Render one diagram into a target container.

```js
CLDGenerator.render({
  container: "#my-cld",
  dataUrl: "/cld.csv",
  diagram: "forest dieoff",
  height: 520,
  downloads: ["svg", "csv", "txt"]
});
```

Options:

| Option             | Required | Description                                       |
| ------------------ | -------: | ------------------------------------------------- |
| `container`        |      Yes | CSS selector or DOM element                       |
| `dataUrl` / `src`  |      Yes | CSV file path                                     |
| `diagram`          |      Yes | Diagram name                                      |
| `height`           |       No | Height in pixels                                  |
| `downloads`        |       No | Array or comma-separated string of download types |
| `exports`          |       No | Backward-compatible alias for download types      |
| `allowDownload`    |       No | Set to `false` to disable downloads               |
| `theme`            |       No | Preset theme: `light`, `dark`, or `minimal`       |
| `title`            |       No | Custom diagram title                              |
| `showToolbar`      |       No | Set to `false` to hide the toolbar                |
| `showLegend`       |       No | Set to `false` to hide the legend                 |
| `showStats`        |       No | Set to `false` to hide stats                      |
| `interactive`      |       No | Set to `false` to disable drag, zoom, and pan     |
| `backgroundColor`  |       No | Diagram canvas background                         |
| `panelBackground`  |       No | Toolbar and legend background                     |
| `borderColor`      |       No | Border and divider color                          |
| `textColor`        |       No | Main text and node label color                    |
| `mutedColor`       |       No | Muted text color                                  |
| `subtleColor`      |       No | Stats text color                                  |
| `nodeColor`        |       No | Node fill color                                   |
| `nodeBorderColor`  |       No | Node border color                                 |
| `positiveColor`    |       No | Positive link color                               |
| `negativeColor`    |       No | Negative link color                               |
| `buttonBackground` |       No | Download button background                        |
| `buttonTextColor`  |       No | Download button text color                        |
| `radius`           |       No | Outer border radius                               |

### `CLDGenerator.renderAll()`

Render all elements marked with `data-cld`.

```js
CLDGenerator.renderAll();
```

Use `data-*` attributes to pass options:

```html
<div
  data-cld
  data-src="/cld.csv"
  data-diagram="forest dieoff"
  data-theme="dark"
  data-title="Forest Dieoff System"
  data-show-legend="false"
  data-positive-color="#22c55e"
  data-negative-color="#ef4444">
</div>
```

---

## Local testing

Do not open the HTML file directly with `file://`.

Instead, run a local web server:

```bash
cd public
python3 -m http.server 3000
```

Then open:

```text
http://localhost:3000/
```

or:

```text
http://localhost:3000/test.html
```

---

## CORS note

The CSV file must be accessible to the browser.

This usually works:

```html
<cld-diagram src="/cld.csv" diagram="forest dieoff"></cld-diagram>
```

This may require CORS headers if the CSV is on another domain:

```html
<cld-diagram src="https://another-site.com/cld.csv" diagram="forest dieoff"></cld-diagram>
```

The easiest setup is for each website to host its own `cld.csv` file.

---

## Troubleshooting

| Problem                                     | Possible cause                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Diagram does not render                     | Check that `src` points to a reachable CSV file                                       |
| `No CLD found` message                      | Make sure the `diagram` attribute exactly matches a value in the CSV `diagram` column |
| CSV fails to load                           | Check the browser console for a 404, CORS error, or blocked request                   |
| Links all appear positive                   | Make sure the `polarity` column uses `+` or `-`                                       |
| Page works locally but not after deployment | Make sure `cld.csv` is in the deployed public/static folder                           |
| Downloads do not appear                     | Check the `downloads` attribute; use `svg,csv,txt` or omit it for the default         |

---

## Example page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CLD Example</title>
</head>
<body>
  <h1>Forest Dieoff CLD</h1>

  <cld-diagram
    src="/cld.csv"
    diagram="forest dieoff"
    height="520"
    theme="light"
    title="Forest Dieoff System"
    downloads="svg,csv,txt">
  </cld-diagram>

  <script src="https://cld-api.onrender.com/cld-generator.js"></script>
</body>
</html>
```

---

## Current hosted demo

```text
https://cld-api.onrender.com/
```

---

## Notes

* Diagrams are interactive by default.
* Users can drag nodes.
* Users can zoom and pan.
* Interaction can be disabled with `interactive="false"`.
* SVG export preserves the current visible layout.
* SVG export uses the configured background color.
* Feedback loops are detected automatically.
* Reinforcing loops are labeled `R`.
* Balancing loops are labeled `B`.
