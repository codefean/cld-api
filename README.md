# CLD API / Embeddable Causal Loop Diagram Generator

An embeddable JavaScript tool for rendering **causal loop diagrams (CLDs)** from a simple CSV file.

Use it to add interactive CLDs to websites, documentation pages, course pages, blogs, public reports, or project dashboards.

The hosted script registers a custom HTML element:

```html
<cld-diagram></cld-diagram>
```

Once added to a page, the element loads CLD data from a CSV file, filters for the requested diagram, renders an interactive causal loop diagram, and optionally lets users download the diagram as SVG, CSV, or TXT.

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

## Recommended use

Most websites should host their own `cld.csv` file and use the hosted CLD script:

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

| Column | Description |
|---|---|
| `diagram` | Name of the causal loop diagram |
| `from` | Source variable |
| `to` | Target variable |
| `polarity` | `+` or `-` |

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

| Type | Description |
|---|---|
| `svg` | Vector image of the current diagram |
| `csv` | CSV export of the selected diagram |
| `txt` | Plain text loop report |

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
    exports: ["svg", "csv", "txt"]
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
  data-downloads="svg,csv,txt">
</div>

<script src="https://cld-api.onrender.com/cld-generator.js"></script>

<script>
  CLDGenerator.renderAll();
</script>
```

---

## Attribute reference

| Attribute | Required | Example | Description |
|---|---:|---|---|
| `src` | Yes | `/cld.csv` | Path or URL to the CSV file |
| `diagram` | Yes | `forest dieoff` | Diagram name to render |
| `height` | No | `520` | Diagram height in pixels |
| `downloads` | No | `svg,csv,txt` | Comma-separated export options |

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
  exports: ["svg", "csv", "txt"]
});
```

Options:

| Option | Required | Description |
|---|---:|---|
| `container` | Yes | CSS selector or DOM element |
| `dataUrl` / `src` | Yes | CSV file path |
| `diagram` | Yes | Diagram name |
| `height` | No | Height in pixels |
| `exports` | No | Array of download types |
| `allowDownload` | No | Set to `false` to disable downloads |

### `CLDGenerator.renderAll()`

Render all elements marked with `data-cld`.

```js
CLDGenerator.renderAll();
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

The easiest setup is for each website to host its own `cld.csv`.

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

- Diagrams are interactive.
- Users can drag nodes.
- Users can zoom and pan.
- SVG export preserves the current visible layout.
- Feedback loops are detected automatically.
- Reinforcing loops are labeled `R`.
- Balancing loops are labeled `B`.
