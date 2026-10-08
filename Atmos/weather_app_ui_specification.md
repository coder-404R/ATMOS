# WeatherWise Web UI Design Specification

This document details the architectural blueprint, design tokens, layout structure, and curated background imagery assets to build a glassmorphic weather web application inspired by the reference design.

---

## 1. Visual Theme & Design Language

* **Style**: Frosted Glassmorphism / Atmospheric Neomorphism
* **Background Strategy**: Full-screen dynamic imagery with dynamic CSS vignette and radial gradient overlays to ensure text contrast.
* **Surface Styling**:
  * Backdrop filter: `blur(20px) saturate(180%)`
  * Background fill: `rgba(255, 255, 255, 0.12)` to `rgba(255, 255, 255, 0.04)`
  * Border stroke: `1px solid rgba(255, 255, 255, 0.18)`
  * Shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.25)`
* **Typography**:
  * Display Header: Clean Modern Serif or Soft Display Sans (e.g., *Playfair Display*, *Cinzel*, or *Cabinet Grotesk*)
  * Data & Body: Modern Geometric Sans-Serif (e.g., *Plus Jakarta Sans*, *Inter*)

---

## 2. Dynamic Weather Backgrounds

High-resolution, license-free photographic assets tailored for full-bleed backgrounds across all 8 weather conditions:

### 1. Sunny / Clear Sky
* **Visual Atmosphere**: Golden sunlight, clean horizon, soft warm highlights.
* **Image URL**: `https://images.unsplash.com/photo-1622278647429-71bc97e964e5?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Warm amber gradient (`rgba(255, 179, 71, 0.15)`)

### 2. Cloudy / Overcast
* **Visual Atmosphere**: Expansive soft grey cumulus layers with diffused natural lighting.
* **Image URL**: `https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Slate blue gradient (`rgba(100, 116, 139, 0.25)`)

### 3. Partly Cloudy
* **Visual Atmosphere**: Golden hour towering cumulonimbus clouds with bright sun rays breaking through.
* **Image URL**: `https://images.unsplash.com/photo-1595865749889-b37a53f4feab?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Golden sunset blend (`rgba(245, 158, 11, 0.18)`)

### 4. Rainy / Drizzle
* **Visual Atmosphere**: Rain droplets cascading against glass with moody cinematic bokeh.
* **Image URL**: `https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Deep teal gradient (`rgba(15, 76, 92, 0.3)`)

### 5. Stormy / Thunderstorm
* **Visual Atmosphere**: Dramatic supercell storm cloud shelf with lightning hues and dark dusk tones.
* **Image URL**: `https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Electric violet-navy (`rgba(30, 27, 75, 0.35)`)

### 6. Snowy / Winter Blizzard
* **Visual Atmosphere**: Serene snow-covered pine ridges with crisp cold mist and pristine white textures.
* **Image URL**: `https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Frosted ice cyan (`rgba(186, 230, 253, 0.2)`)

### 7. Windy / High Velocity Gale
* **Visual Atmosphere**: Tall coastal grass bending before sweeping storm winds under an open sky.
* **Image URL**: `https://images.unsplash.com/photo-1505672678564-9b2f6ef53bf6?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Cool slate breeze (`rgba(148, 163, 184, 0.2)`)

### 8. Foggy / Mist
* **Visual Atmosphere**: Ethereal pine canopy blanketed in rolling dawn fog.
* **Image URL**: `https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2560&q=80`
* **Accent Overlay Tint**: Pale silver vapor (`rgba(226, 232, 240, 0.22)`)

---

## 3. UI Layout Architecture

The user interface follows a 3-tier composite layout:

```
+------------------------------------------------------------------------------------+
|  [Sidebar Navigation]  |  [Header: Location & Search / Download Pill]              |
|  - Brand (WeatherWise) |                                                           |
|  - Severity Status     |  [Current Temp: 18° | H: 29° L: 12°]   [Tagline / Intro]  |
|    Metric & Curve      |  [Headline: "Stormy with partly cloudy"]                  |
|  - Interactive Mini    |                                       [Recent Cities]     |
|    Globe / Area Picker |                                       - Liverpool: 16°    |
|                        |                                       - Palermo: -2°      |
|                        |-----------------------------------------------------------|
|                        |  [Weekly Temperature Wave & Daily Forecast]               |
|                        |  Sun(28°) Mon(26°) Tue(27°) Wed(23°)* Thu(30°) Fri(25°)   |
+------------------------------------------------------------------------------------+
```

### 3.1 Left Column: Glass Floating Sidebar
1. **Header**: Clean logo badge (`WeatherWise`) with subtle glow.
2. **Severity / Status Card**:
   * Label: `Status`
   * Trend badge: `↑ 23.8%` with clock/alert icon.
   * Highlight chip: `Dangerous` pill badge over an animated SVG bezier curve.
   * Action link: `See More details >`.
3. **Select Area Card**:
   * Interactive globe canvas or SVG map projection with radar pinpoints.
   * Current active pin: `Brooklyn, New York, USA` inside a pill button.

### 3.2 Main Content Area (Top & Center)
1. **Navigation & Controls**:
   * Left: Location indicator pin `Brooklyn, New York, USA (Friday, January 4)`.
   * Right: Glass circular search button and pill action button `Download App`.
2. **Primary Weather Display**:
   * Super-sized temperature numeral: `18°`.
   * High / Low temperature indicators: `H 29°`, `L 12°`.
   * Hero descriptive condition text: `Stormy with partly cloudy`.
3. **Secondary Information**:
   * Editorial tagline: *"With real time data and advanced technology, we provide reliable forecasts for any location around the world."*
   * **Recently Searched Glass Cards**:
     * Card 1: Cloud icon, `16°`, `Liverpool, UK`, `Partly Cloudy`.
     * Card 2: Thunder/Rain icon, `-2°`, `Palermo, Italy`, `RainThunder`.

### 3.3 Bottom Area: Temperature Trend & Forecast Strip
* Continuous smooth SVG spline/sinusoidal temperature wave spanning across days.
* Active day spotlight indicator (e.g., illuminated node on `Wednesday`).
* Daily columns featuring:
  * Day name (`Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`).
  * Temperature readouts (`28°`, `26°`, `27°`, `23°`, `30°`, `25°`).

---

## 4. Glassmorphism CSS Snippets

```css
/* Glass Card Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

/* Inner Pill Controls */
.glass-pill {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  padding: 8px 16px;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s ease;
}

.glass-pill:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.45);
}

/* Background Transition Container */
.weather-background {
  position: fixed;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: background-image 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.weather-background::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.45) 100%
  );
}
```

---

## 5. Implementation Roadmap
1. **Background Switcher**: Bind the current weather condition code (e.g., OpenWeatherMap `id` or WeatherAPI `code`) to swap the background photo and color tint smoothly.
2. **Chart.js / SVG Curve**: Render the 7-day temperature path as an interpolated cubic spline with a glowing radial SVG marker on today's forecast.
3. **Responsive Breakpoints**: Collapse the left glass panel into a floating bottom sheet or slide-over drawer on screens smaller than 1024px.