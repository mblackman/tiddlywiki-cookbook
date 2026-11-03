# TiddlyWiki Cookbook (`$:/plugins/mblackman/cookbook`)

A structured recipe manager, live ingredient scaler, *mise en place* checklist, countertop Cook Mode, and post-cook iteration journal for **TiddlyWiki v5.4.x+**.

## Features

- **View Template Body Cascade (`Recipe` & `CookLog`)**: Automatically routes any tiddler tagged `Recipe` to a two-column cooking workspace and any tiddler tagged `CookLog` to a structured session summary.
- **Live Batch Scaling (`½×` to `3×`)**: Scales `base-servings` and pipe-delimited or inline `<<ing>>` ingredient quantities on the fly—supporting integers, decimals, simple fractions (`1/2`), and mixed fractions (`1 1/2`).
- **Ephemeral Mise en Place Checklists**: Check off prepped ingredients in `$:/temp/recipe/mise/...` without dirtying the recipe tiddler's modification timestamp.
- **Countertop Cook Mode**: Enlarges recipe typography and activates the Suite Design System's `data-suite-density="touch"` mode (`44px` countertop touch targets).
- **Pinned Kitchen Tweaks & Iteration History**: Capture post-cook tasting logs inline and pin `"Next Time"` lessons directly to the recipe header callout with a single click.
- **3-Tier Suite Design System**: Built on `--suite-*` custom properties (`oklab` perceptual mixing, WCAG 1.4.11 `>= 3:1` control borders, `tabular-nums`, `@container` queries, and standalone `:where(:root, .tc-page-container)` fallbacks).

## Data Model

| Tiddler Type | Required Tag | Key Fields |
| :--- | :--- | :--- |
| **Recipe Tiddler** | `Recipe` | `dish-type`, `cuisine`, `status`, `rating`, `prep-time`, `cook-time`, `oven-temp`, `base-servings`, `yield-unit`, `equipment`, `source-name`, `source-url`, `pinned-tweaks`, `ingredients`, `text` |
| **Cook Log Tiddler** | `CookLog` | `recipe`, `cook-date`, `scale-used`, `session-rating`, `modifications`, `verdict`, `next-time`, `text` |

### Ingredient Field Syntax

```text
# Dough (70% Hydration)
400 | g | [[Bread Flour]] | King Arthur preferred
280 | g | [[Warm Water]] | 95°F / 35°C
1/2 | tsp | [[Instant Yeast]] |
```

Or invoke `<<ing qty="200" unit="g" item="[[Bread Flour]]" note="sifted">>` inline inside WikiText.

## Development & Build

```bash
# Install dependencies
npm install

# Run Jest test suite
npm test

# Start live-reloading development server on http://127.0.0.1:8080
npm run dev

# Build plugin (.tid + .json), demo wiki, and plugin library
npm run build-all
```
