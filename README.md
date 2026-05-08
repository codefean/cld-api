# CLD Embed Starter

This folder contains Step 1 and Step 2 for the embeddable CLD generator.

## Files

- `public/cld.csv` — sample data file containing multiple CLDs.
- `public/test.html` — example page showing the intended embed syntax.

## Current embed syntax

```html
<script src="/cld-generator.js"></script>

<cld-diagram
  src="/cld.csv"
  diagram="forest dieoff"
  height="520"
  downloads="svg,csv,txt">
</cld-diagram>
```

## CSV format

```csv
diagram,from,to,polarity
forest dieoff,Drought,Tree Stress,+
forest dieoff,Tree Stress,Tree Mortality,+
```

Required columns:

- `diagram`
- `from`
- `to`
- `polarity`

## Testing later

Once `cld-generator.js` exists, run a local server from the `public` folder:

```bash
cd public
python3 -m http.server 3000
```

Then open:

```text
http://localhost:3000/test.html
```

Do not test with `file://`, because browser fetches usually need a local server.


## Step 3 complete

This starter now includes:

- `public/cld-generator.js`

It registers the custom element:

```html
<cld-diagram src="/cld.csv" diagram="forest dieoff"></cld-diagram>
```

It also exposes a JavaScript API:

```html
<div id="my-cld"></div>

<script src="/cld-generator.js"></script>
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

## Test

Run this from the `public` folder:

```bash
python3 -m http.server 3000
```

Then open:

```text
http://localhost:3000/test.html
```
