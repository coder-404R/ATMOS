# Atmos — Modern Weather UI Specification

A sleek, immersive, glassmorphic weather platform designed for desktop and responsive web displays.

---

## 1. Design System & Visual Identity

* **Brand Name**: Atmos
* **Design Philosophy**: Frosted Glassmorphism, dynamic contextual photography backgrounds, clean sans-serif typography, high contrast for essential metrics.
* **Color Palette**:
  * Glass Surface: `rgba(255, 255, 255, 0.12)` to `rgba(255, 255, 255, 0.22)`
  * Glass Border: `1px solid rgba(255, 255, 255, 0.25)`
  * Primary Text: `#FFFFFF`
  * Secondary Text: `rgba(255, 255, 255, 0.72)`
  * Weather Headline Highlight: Warm Ochre (`#D4A373`) or Crisp Amber (`#F4A261`) depending on time/condition
  * Chart Line / Accents: `#E9C46A` with soft radial glows

---

## 2. Layout & Wireframe Architecture

The screen is split into a fluid background layer, a persistent floating sidebar on the left, and a multi-tiered dashboard on the main canvas:

```text
+--------------------------------------------------------------------------------------------------+
| [ BACKGROUND: Fullscreen dynamic image overlay with subtle gradient vignette ]                  |
|                                                                                                  |
| +-------------------+  [Location Indicator]  Brooklyn, New York, USA         [Q Search] [Get App]|
| |                   |                                                                            |
| |       ATMOS       |    18°  H: 29° L: 12°             "With real-time data and advanced        |
| |                   |                                    technology, we provide reliable..."     |
| | [Status Card]     |    Stormy with partly cloudy                                               |
| | - Risk Badge      |                                   [Recent Cities Cards]                    |
| | - Curve Trend     |                                   +-----------------+ +------------------+ |
| |                   |                                   | Liverpool  16°  | | Palermo    -2°   | |
| | [Globe / Radar]   |                                   +-----------------+ +------------------+ |
| | - Area Selector   |                                                                            |
| | - Mini Globe Map  |  [ Weekly Forecast & Interactive Temperature Sine Wave ]                   |
| |                   |   Sun      Mon      Tue      Wed      Thu      Fri                         |
| | [Quick Nav Bar]   |   28°      26°      27°      23°      30°      25°                         |
| +-------------------+  ~~~~~~~~~~~~~~~~~~~*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~                        |
+--------------------------------------------------------------------------------------------------+
```

---

## 3. UI Component Breakdown

### Left Panel (Floating Glass Dock)
* **Brand Logo**: "Atmos" in rounded geometric typography with soft inner glow.
* **Status Card**:
  * Indicator tag: e.g., "Dangerous" / "Severe" / "Optimal".
  * Sparkline/Trend meter indicating localized pressure or air quality index.
* **Area Selection / Mini Globe**:
  * Radial globe vector pinpointing current coordinates with pulsing radar ping.
  * Direct location switch dropdown pill at the bottom.

### Header Navigation
* **Current Coordinates**: Pin icon + City, Region, Country + Live Date/Time.
* **Utility Actions**: Minimalist rounded search icon pill and "Download App" glass button.

### Center Hero
* **Temperature Metric**: Massive display font (e.g., `18°`) with secondary High/Low chips (`H 29° / L 12°`).
* **Condition Statement**: Expressive descriptive copy (e.g., *"Stormy with partly cloudy"*).
* **Sine-Wave 7-Day Forecast**:
  * Day labels along the horizontal axis (`Sunday` → `Friday`).
  * Continuous bezier curve temperature graph with glowing junction points on active/selected days.
  * Day high/low readings anchored below each node.

### Right Panel Widget
* **Marketing/Mission Snip**: Short clean paragraph highlighting forecast precision.
* **Recently Searched Stack**: Compact horizontal cards displaying thumbnail condition icons, city names, and ambient temperatures.

---

## 4. Weather Condition Imagery & Asset Directory

Use dynamic full-bleed background images with a subtle darkened CSS overlay (`linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45))`) to preserve text legibility.

| Condition | Atmosphere & Mood | Recommended Source URL (Unsplash CDN) |
|---|---|---|
| **Sunny** | Golden sunlight, clear sky, high clarity | `https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80` |
| **Cloudy** | Overcast, soft diffused daylight, dense silver cloud deck | `https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80` |
| **Partly Cloudy** | Sunbeams breaking through fluffy cumulus clouds | `https://images.unsplash.com/photo-1595865701170-17937397b2f4?auto=format&fit=crop&w=1920&q=80` |
| **Rainy** | Raindrops, wet glass texture, moody blue-grey tones | `https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=1920&q=80` |
| **Stormy** | Dramatic anvil clouds, dark purple skies, distant lightning flashes | `https://images.unsplash.com/photo-1511289081-d06dda19034d?auto=format&fit=crop&w=1920&q=80` |
| **Snowy** | Pristine white landscape, falling powder, cool frosted tones | `https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80` |
| **Windy** | Swaying tall grasses/trees under dramatic swirling skies | `https://images.unsplash.com/photo-1505672678556-37422e93d253?auto=format&fit=crop&w=1920&q=80` |
| **Foggy** | Dense mist, atmospheric silhouette trees, muted ethereal aesthetic | `https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=1920&q=80` |

---

## 5. Starter CSS Stylesheet for Glassmorphism

```css
:root {
  --glass-bg: rgba(255, 255, 255, 0.14);
  --glass-border: rgba(255, 255, 255, 0.22);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
  --text-primary: #ffffff;
  --text-muted: rgba(255, 255, 255, 0.7);
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  color: var(--text-primary);
  transition: background-image 0.6s ease-in-out;
}

/* Base Glassmorphic Container */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: var(--glass-shadow);
}

/* Glass interactive button */
.glass-btn {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(12px);
  border-radius: 9999px;
  padding: 10px 22px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}
```

---

## 6. Dynamic Background Mapping (JavaScript Snippet)

```javascript
const weatherBackgrounds = {
  sunny: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=1920&q=80',
  cloudy: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
  partlyCloudy: 'https://images.unsplash.com/photo-1595865701170-17