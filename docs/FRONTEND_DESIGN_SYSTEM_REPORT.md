# RoleReady Frontend Design System Report
## Complete Design Specification for Figma Replication

---

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Component Specifications](#component-specifications)
6. [Effects & Visual Treatments](#effects--visual-treatments)
7. [Interactive States](#interactive-states)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Icon System](#icon-system)
10. [Animation & Transitions](#animation--transitions)

---

## Design Philosophy

### Core Principles
- **Dual Theme System**: Light (Pure White) and Dark (Glossy Deep Purple)
- **Glassmorphism**: Extensive use of backdrop blur and transparency
- **Gradient Accents**: Blue-to-purple gradients for primary actions
- **Minimal Animations**: Instant UI updates for performance (animations disabled globally)
- **Clean & Modern**: Spacious layouts with subtle borders and shadows

### Visual Style
- **Light Mode**: Pure white backgrounds (#FFFFFF) with subtle gray borders
- **Dark Mode**: Deep purple gradient backgrounds (#0f0a1e to #1e293b) with glassmorphic cards
- **Primary Brand Colors**: Blue (#3b82f6) and Purple (#8b5cf6 / #a855f7)
- **Accent Gradients**: Blue-to-purple gradients throughout

---

## Color System

### Light Theme Colors

#### Backgrounds
| Token | Hex Code | Usage |
|-------|----------|-------|
| `background` | `#FFFFFF` | Main page background (pure white) |
| `sidebarBackground` | `#FFFFFF` | Sidebar background |
| `headerBackground` | `#FFFFFF` | Header/toolbar background |
| `cardBackground` | `#FFFFFF` | Card/container backgrounds |
| `hoverBackground` | `rgba(0, 0, 0, 0.02)` | Hover state backgrounds |
| `hoverBackgroundStrong` | `rgba(0, 0, 0, 0.04)` | Strong hover states |
| `inputBackground` | `rgba(0, 0, 0, 0.03)` | Input field backgrounds |

#### Text Colors
| Token | Hex Code | Usage |
|-------|----------|-------|
| `primaryText` | `#111827` | Main headings, primary text |
| `secondaryText` | `#4b5563` | Body text, descriptions |
| `tertiaryText` | `#6b7280` | Muted text, labels |
| `activeText` | `#7c3aed` | Active navigation items |
| `activeBlueText` | `#2563eb` | Active blue text |

#### Borders
| Token | Hex Code | Usage |
|-------|----------|-------|
| `border` | `rgba(0, 0, 0, 0.08)` | Default borders (very subtle) |
| `borderFocused` | `rgba(107, 114, 128, 0.4)` | Focused input borders |

#### Accent Colors
| Token | Hex Code | Usage |
|-------|----------|-------|
| `primaryBlue` | `#3b82f6` | Primary buttons, links |
| `primaryBlueHover` | `#2563eb` | Primary button hover |

#### Badge Colors (Light Mode)
| Type | Background | Text | Border |
|------|-----------|------|--------|
| Info | `rgba(59, 130, 246, 0.1)` | `#1e40af` | `rgba(59, 130, 246, 0.3)` |
| Success | `rgba(16, 185, 129, 0.1)` | `#047857` | `rgba(16, 185, 129, 0.3)` |
| Warning | `rgba(234, 179, 8, 0.1)` | `#a16207` | `rgba(234, 179, 8, 0.3)` |
| Error | `rgba(239, 68, 68, 0.1)` | `#b91c1c` | `rgba(239, 68, 68, 0.3)` |
| Purple | `rgba(168, 85, 247, 0.1)` | `#6b21a8` | `rgba(168, 85, 247, 0.3)` |
| Neutral | `rgba(107, 114, 128, 0.1)` | `#4b5563` | `rgba(107, 114, 128, 0.3)` |

#### Status Colors (Light Mode)
| Token | Hex Code |
|-------|----------|
| `errorRed` | `#dc2626` |
| `successGreen` | `#059669` |
| `warningYellow` | `#ca8a04` |

---

### Dark Theme Colors

#### Backgrounds
| Token | Hex Code/Gradient | Usage |
|-------|------------------|-------|
| `background` | `#0f0a1e` | Main page background |
| Body Gradient | `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)` | Full page gradient |
| `sidebarBackground` | `linear-gradient(180deg, rgba(25, 15, 45, 0.6) 0%, rgba(15, 10, 30, 0.6) 100%)` | Sidebar with backdrop blur |
| `headerBackground` | `rgba(15, 10, 30, 0.4)` | Header/toolbar |
| `cardBackground` | `rgba(255, 255, 255, 0.02)` | Card backgrounds |
| `hoverBackground` | `rgba(255, 255, 255, 0.02)` | Hover states |
| `hoverBackgroundStrong` | `rgba(255, 255, 255, 0.04)` | Strong hover |
| `inputBackground` | `rgba(255, 255, 255, 0.03)` | Input fields |

#### Text Colors
| Token | Hex Code | Usage |
|-------|----------|-------|
| `primaryText` | `#f1f5f9` | Main headings |
| `secondaryText` | `#cbd5e1` | Body text |
| `tertiaryText` | `#94a3b8` | Muted text |
| `activeText` | `#e9d5ff` | Active navigation |
| `activeBlueText` | `#60a5fa` | Active blue text |

#### Borders
| Token | Hex Code | Usage |
|-------|----------|-------|
| `border` | `rgba(203, 213, 225, 0.15)` | Default borders |
| `borderFocused` | `rgba(203, 213, 225, 0.4)` | Focused borders |

#### Accent Colors
| Token | Hex Code | Usage |
|-------|----------|-------|
| `primaryBlue` | `#3b82f6` | Primary actions |
| `primaryBlueHover` | `#2563eb` | Primary hover |

#### Badge Colors (Dark Mode)
| Type | Background | Text | Border |
|------|-----------|------|--------|
| Info | `rgba(59, 130, 246, 0.15)` | `#3b82f6` | `rgba(59, 130, 246, 0.3)` |
| Success | `rgba(16, 185, 129, 0.15)` | `#10b981` | `rgba(16, 185, 129, 0.3)` |
| Warning | `rgba(234, 179, 8, 0.15)` | `#eab308` | `rgba(234, 179, 8, 0.3)` |
| Error | `rgba(239, 68, 68, 0.15)` | `#ef4444` | `rgba(239, 68, 68, 0.3)` |
| Purple | `rgba(168, 85, 247, 0.2)` | `#a855f7` | `rgba(168, 85, 247, 0.3)` |
| Neutral | `rgba(148, 163, 184, 0.15)` | `#cbd5e1` | `rgba(148, 163, 184, 0.3)` |

#### Status Colors (Dark Mode)
| Token | Hex Code |
|-------|----------|
| `errorRed` | `#ef4444` |
| `successGreen` | `#10b981` |
| `warningYellow` | `#eab308` |

---

### Gradient Specifications

#### Primary Gradients
1. **Blue to Purple** (Most Common)
   - Start: `#3b82f6` (Blue)
   - End: `#8b5cf6` or `#a855f7` (Purple)
   - Direction: `to right` or `135deg`
   - Usage: Primary buttons, navigation active states, brand accents

2. **RoleReady Logo Gradient**
   - Start: `#8B5CF6` (Purple)
   - End: `#3B82F6` (Blue)
   - Direction: `to right`
   - Usage: Logo text, brand headers

3. **Sidebar Section Accents**
   - WORKSPACE: `#a855f7` (Purple)
   - PREPARE: `#3b82f6` (Blue)
   - APPLY: `linear-gradient(to bottom, #06b6d4, #14b8a6)` (Teal gradient)
   - CONNECT: `#8b5cf6` (Purple)

4. **Hero Section Gradient**
   - `linear-gradient(to right, #3b82f6, #8b5cf6, #6366f1)`
   - Usage: Home page hero background

5. **Loading Screen Gradient**
   - `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
   - Usage: Initial loading screen

---

## Typography

### Font Families
- **Primary**: `Inter` (via CSS variable `--font-inter`)
- **Fallback**: `system-ui, sans-serif`
- **Monospace**: `var(--font-mono), monospace`

### Font Sizes & Weights

#### Headings
| Element | Size | Weight | Line Height | Color (Light) | Color (Dark) |
|---------|------|--------|-------------|---------------|--------------|
| H1 (Page Title) | `24px` / `1.5rem` | `600` | `1.2` | `#111827` | `#f1f5f9` |
| H2 (Section Title) | `20px` / `1.25rem` | `600` | `1.3` | `#111827` | `#f1f5f9` |
| H3 (Subsection) | `18px` / `1.125rem` | `600` | `1.4` | `#111827` | `#f1f5f9` |
| Logo Text | `24px` / `1.5rem` | `700` | `1.2` | Gradient | Gradient |

#### Body Text
| Element | Size | Weight | Line Height | Color (Light) | Color (Dark) |
|---------|------|--------|-------------|---------------|--------------|
| Body Large | `16px` / `1rem` | `400` | `1.5` | `#4b5563` | `#cbd5e1` |
| Body Regular | `14px` / `0.875rem` | `400` | `1.5` | `#4b5563` | `#cbd5e1` |
| Body Small | `12px` / `0.75rem` | `400` | `1.4` | `#6b7280` | `#94a3b8` |
| Caption | `11px` / `0.6875rem` | `400` | `1.3` | `#6b7280` | `#94a3b8` |

#### UI Elements
| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Button Text | `14px` | `500` | Standard buttons |
| Button Text Large | `16px` | `600` | Primary CTAs |
| Navigation Label | `14px` | `500` | Sidebar items |
| Navigation Label Small | `12px` | `500` | Collapsed sidebar |
| Section Header | `12px` | `600` | Uppercase section titles |
| Badge Text | `12px` | `500` | Status badges |

### Text Treatments

#### Gradient Text (RoleReady Logo)
```css
background: linear-gradient(to right, #8B5CF6, #3B82F6);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
color: transparent;
display: inline-block;
```

#### Section Headers (Uppercase)
- Font size: `12px`
- Font weight: `600`
- Letter spacing: `0.05em` (tracking-wider)
- Text transform: `uppercase`
- Color: Section-specific color (purple, blue, teal)

---

## Layout & Spacing

### Grid System
- **Container**: Max width `7xl` (1280px) on large screens
- **Dashboard Grid**: `12-column` layout
  - Left Column: `7 cols` (lg) / `8 cols` (xl)
  - Right Column: `5 cols` (lg) / `4 cols` (xl)

### Spacing Scale (Tailwind)
| Scale | Value | Usage |
|-------|-------|-------|
| `0` | `0px` | No spacing |
| `1` | `4px` | Tight spacing |
| `2` | `8px` | Small gaps |
| `3` | `12px` | Default gaps |
| `4` | `16px` | Medium spacing |
| `5` | `20px` | Large spacing |
| `6` | `24px` | Section spacing |
| `8` | `32px` | Large section spacing |
| `12` | `48px` | Extra large spacing |
| `16` | `64px` | Hero spacing |

### Component Spacing

#### Sidebar
- **Width (Expanded)**: `256px` (w-64)
- **Width (Collapsed)**: `80px` (w-20)
- **Padding**: `16px` (p-4)
- **Item Padding**: `12px 16px` (px-4 py-3)
- **Item Gap**: `4px` (space-y-1)

#### Dashboard
- **Padding**: `12px` (sm) / `16px` (md) / `24px` (lg)
- **Gap Between Widgets**: `12px` (sm) / `16px` (md)
- **Card Padding**: `20px` (p-5) / `24px` (p-6)

#### Cards/Widgets
- **Padding**: `16px` (p-4) to `24px` (p-6)
- **Border Radius**: `12px` (rounded-xl) to `16px` (rounded-2xl)
- **Gap Between Elements**: `12px` to `16px`

#### Forms
- **Input Padding**: `12px 16px` (px-4 py-3)
- **Input Gap**: `8px` between label and input
- **Form Group Gap**: `16px` to `20px`

---

## Component Specifications

### Buttons

#### Primary Button
```
Size: 
  - Padding: 12px 24px (px-6 py-3)
  - Height: ~44px
  - Border Radius: 8px (rounded-lg)

Colors:
  - Background: #3b82f6 (primaryBlue)
  - Text: #FFFFFF
  - Hover: #2563eb (primaryBlueHover)
  - Border: 1px solid #3b82f6

Typography:
  - Font Size: 14px
  - Font Weight: 500
  - Line Height: 1.5

Effects:
  - Box Shadow: 0 4px 12px rgba(59, 130, 246, 0.4)
  - Hover Shadow: 0 6px 16px rgba(59, 130, 246, 0.5)
  - Transition: All 0.2s ease (but disabled globally)
```

#### Secondary Button
```
Size:
  - Padding: 12px 24px
  - Border Radius: 8px

Colors:
  - Background: inputBackground (rgba(0,0,0,0.03) light / rgba(255,255,255,0.03) dark)
  - Text: secondaryText
  - Border: 1px solid border color
  - Hover Background: hoverBackgroundStrong

Typography:
  - Font Size: 14px
  - Font Weight: 500
```

#### Gradient Button (Premium Actions)
```
Size:
  - Padding: 8px 16px to 12px 24px
  - Border Radius: 8px

Colors:
  - Background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%)
  - Text: #FFFFFF
  - Box Shadow: 0 4px 12px rgba(168, 85, 247, 0.4)
  - Hover Shadow: 0 6px 16px rgba(168, 85, 247, 0.5)

Typography:
  - Font Size: 14px
  - Font Weight: 500
```

#### Icon Button
```
Size:
  - Padding: 8px (p-2) to 12px (p-3)
  - Border Radius: 8px (rounded-lg)
  - Icon Size: 18px to 20px

Colors:
  - Background: Transparent or inputBackground
  - Icon Color: secondaryText
  - Hover Background: hoverBackground
```

### Cards / Widgets

#### Standard Card
```
Size:
  - Padding: 20px (p-5) to 24px (p-6)
  - Border Radius: 12px (rounded-xl) to 16px (rounded-2xl)
  - Border: 1px solid border color

Colors (Light):
  - Background: #FFFFFF
  - Border: rgba(0, 0, 0, 0.08)
  - Box Shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06)

Colors (Dark):
  - Background: rgba(255, 255, 255, 0.05)
  - Border: rgba(255, 255, 255, 0.1)
  - Box Shadow: 0 4px 20px rgba(0, 0, 0, 0.3)
  - Backdrop Filter: blur(12px)
```

#### Glassmorphic Card (Dark Mode)
```
Background: rgba(255, 255, 255, 0.02) to rgba(255, 255, 255, 0.05)
Backdrop Filter: blur(12px)
-webkit-backdrop-filter: blur(12px)
Border: 1px solid rgba(255, 255, 255, 0.1)
Box Shadow: 0 4px 20px rgba(0, 0, 0, 0.3)
```

### Sidebar Navigation

#### Logo Section
```
Expanded:
  - Container: Padding 16px (px-4 py-4)
  - Card Background: cardBackground
  - Border: 1px solid border
  - Border Radius: 12px (rounded-xl)
  - Box Shadow: 0 4px 12px border color at 20% opacity
  
Logo Icon:
  - Size: 28px
  - Container: 48px x 48px (w-12 h-12)
  - Border Radius: 50% (rounded-full)
  - Background: linear-gradient(135deg, rgba(30, 27, 75, 0.95), rgba(49, 46, 129, 0.95))
  - Box Shadow: 0 0 25px primaryBlue at 60%, 0 0 50px primaryBlue at 30%
  - Glow Rings: Multiple layers with blur-xl
  
Text:
  - Logo: 18px, bold, gradient text
  - Tagline: 12px, secondaryText
```

#### Navigation Items
```
Inactive State:
  - Background: Transparent
  - Text Color: secondaryText (#4b5563 light / #cbd5e1 dark)
  - Icon Size: 18px
  - Padding: 10px 12px (px-3 py-2.5)
  - Border Radius: 8px (rounded-lg)
  - Gap: 12px (gap-3)

Active State:
  - Background: Section-specific color with opacity
    - WORKSPACE: rgba(168, 85, 247, 0.15) light / rgba(255,255,255,0.08) dark
    - PREPARE: rgba(59, 130, 246, 0.1) light
    - APPLY: rgba(20, 184, 166, 0.1) light
    - CONNECT: rgba(139, 92, 246, 0.15) light
  - Text Color: Section color (light) / #FFFFFF (dark)
  - Icon Color: Section color (light) / White (dark)

Hover State:
  - Background: hoverBackground
  - Transition: None (disabled globally)
```

#### Section Headers
```
Size:
  - Font Size: 12px
  - Font Weight: 600
  - Letter Spacing: 0.05em
  - Text Transform: Uppercase
  - Padding: 12px (px-3)
  - Margin Bottom: 8px (mb-2)

Colors:
  - WORKSPACE: #a855f7
  - PREPARE: #3b82f6
  - APPLY: #14b8a6
  - CONNECT: #8b5cf6
```

### Input Fields

#### Text Input
```
Size:
  - Padding: 12px 16px (px-4 py-3)
  - Border Radius: 8px (rounded-lg)
  - Border Width: 2px
  - Font Size: 14px

Colors (Light):
  - Background: rgba(0, 0, 0, 0.03)
  - Border: rgba(0, 0, 0, 0.08)
  - Text: #111827
  - Placeholder: #6b7280

Colors (Dark):
  - Background: rgba(255, 255, 255, 0.03)
  - Border: rgba(203, 213, 225, 0.15)
  - Text: #f1f5f9
  - Placeholder: #94a3b8

Focus State:
  - Border Color: borderFocused or primaryBlue
  - Box Shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
```

#### Select Dropdown
```
Same as Text Input, plus:
- Color Scheme: dark (for dark theme) / light (for light theme)
- Option Colors:
  - Light: Background #FFFFFF, Text #1e293b, Hover/Selected #3b82f6
  - Dark: Background #1a1625, Text #cbd5e1, Hover/Selected #3b82f6
```

### Badges / Status Indicators

#### Info Badge
```
Size:
  - Padding: 4px 12px (px-3 py-1)
  - Border Radius: 8px (rounded-lg)
  - Font Size: 12px
  - Font Weight: 500

Colors (Light):
  - Background: rgba(59, 130, 246, 0.1)
  - Text: #1e40af
  - Border: rgba(59, 130, 246, 0.3)

Colors (Dark):
  - Background: rgba(59, 130, 246, 0.15)
  - Text: #3b82f6
  - Border: rgba(59, 130, 246, 0.3)
```

(Similar structure for Success, Warning, Error, Purple, Neutral badges)

### Dashboard Widgets

#### Metrics Grid Card
```
Size:
  - Padding: 16px (p-4)
  - Border Radius: 12px (rounded-xl)
  - Gap: 8px to 12px

Layout:
  - Grid: 2 columns (mobile) / 4 columns (desktop)
  - Grid Gap: 8px (sm) / 12px (md)
```

#### Todos Widget
```
Size:
  - Padding: 20px (p-5)
  - Border Radius: 16px (rounded-2xl)
  - Max Height: 500px (scrollable)

Header:
  - Title: 24px, bold
  - Subtitle: 14px, secondaryText
  - Add Button: Gradient purple button

Content:
  - Task Items: 10px gap (space-y-2.5)
  - Scrollbar: Thin, custom styled
```

#### Quick Actions Widget
```
Size:
  - Padding: 12px (sm) / 16px (md)
  - Border Radius: 12px (sm) / 16px (md)
  - Grid: 4 columns
  - Gap: 8px (sm) / 12px (md)

Hover Effect:
  - Scale: 1.01
  - Shadow: xl
```

---

## Effects & Visual Treatments

### Shadows

#### Light Mode Shadows
| Level | Shadow | Usage |
|-------|--------|-------|
| Small | `0 1px 3px rgba(0, 0, 0, 0.1)` | Subtle elevation |
| Medium | `0 2px 12px rgba(0, 0, 0, 0.08), 0 4px 24px rgba(0, 0, 0, 0.06)` | Cards, widgets |
| Large | `0 4px 20px rgba(0, 0, 0, 0.1)` | Modals, dropdowns |
| Colored (Blue) | `0 4px 12px rgba(59, 130, 246, 0.4)` | Primary buttons |
| Colored (Purple) | `0 4px 12px rgba(168, 85, 247, 0.4)` | Premium actions |

#### Dark Mode Shadows
| Level | Shadow | Usage |
|-------|--------|-------|
| Medium | `0 4px 20px rgba(0, 0, 0, 0.3)` | Cards, widgets |
| Colored (Blue) | `0 0 25px rgba(96, 165, 250, 0.6), 0 0 50px rgba(96, 165, 250, 0.3)` | Logo glow |

### Backdrop Blur
- **Standard**: `blur(12px)` / `backdrop-filter: blur(12px)`
- **Strong**: `blur(20px)` (headers, sidebars)
- **Subtle**: `blur(8px)` (tooltips)

### Glow Effects

#### Logo Glow (Dark Mode)
```
Multiple Layers:
1. Outer Ring: -inset-3, opacity-70, blur-xl, radial-gradient(primaryBlue)
2. Middle Ring: -inset-2, opacity-50, blur-lg, radial-gradient(purple)
3. Inner Shadow: box-shadow with primaryBlue at 60% opacity

Box Shadow:
0 0 25px rgba(96, 165, 250, 0.6)
0 0 50px rgba(96, 165, 250, 0.3)
inset 0 0 15px rgba(96, 165, 250, 0.4)
```

#### Button Glow
```
Primary Button:
- Standard: 0 4px 12px rgba(59, 130, 246, 0.4)
- Hover: 0 6px 16px rgba(59, 130, 246, 0.5)

Gradient Button:
- Standard: 0 4px 12px rgba(168, 85, 247, 0.4)
- Hover: 0 6px 16px rgba(168, 85, 247, 0.5)
```

### Borders

#### Standard Border
- **Light**: `rgba(0, 0, 0, 0.08)` - Very subtle
- **Dark**: `rgba(203, 213, 225, 0.15)` - Slightly more visible

#### Focused Border
- **Light**: `rgba(107, 114, 128, 0.4)`
- **Dark**: `rgba(203, 213, 225, 0.4)`

### Scrollbars

#### Custom Scrollbar Styling
```
Width: 8px to 12px
Track Background: rgba(15, 10, 30, 0.3) (dark) / #f3f4f6 (light)
Thumb Background: rgba(148, 163, 184, 0.5) (dark) / #d1d5db (light)
Border Radius: 4px to 6px
Border: 2px solid track color (dark mode)
```

---

## Interactive States

### Hover States
- **Background**: `hoverBackground` or `hoverBackgroundStrong`
- **Scale**: `1.01` to `1.05` (subtle)
- **Shadow**: Enhanced shadow
- **Border**: Slightly more visible
- **Transition**: Disabled globally (instant)

### Active States
- **Background**: Section-specific color with opacity
- **Text Color**: Section color (light) / White (dark)
- **Icon Color**: Matches text color

### Focus States
- **Border**: `borderFocused` color
- **Box Shadow**: `0 0 0 3px rgba(59, 130, 246, 0.1)`
- **Outline**: None (using box-shadow instead)

### Disabled States
- **Opacity**: `0.5`
- **Cursor**: `not-allowed`
- **Background**: `inputBackground`
- **Text**: `tertiaryText`

---

## Responsive Breakpoints

### Tailwind Breakpoints
| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | `640px` | Small tablets |
| `md` | `768px` | Tablets |
| `lg` | `1024px` | Desktop |
| `xl` | `1280px` | Large desktop |
| `2xl` | `1536px` | Extra large |

### Layout Changes

#### Sidebar
- **Desktop**: Always visible, collapsible
- **Mobile**: Hidden by default, overlay when open

#### Dashboard Grid
- **Mobile**: Single column (grid-cols-1)
- **Desktop**: 12-column grid
  - Left: 7 cols (lg) / 8 cols (xl)
  - Right: 5 cols (lg) / 4 cols (xl)

#### Spacing
- **Mobile**: Reduced padding (p-3 = 12px)
- **Desktop**: Standard padding (p-4 to p-6 = 16px to 24px)

#### Typography
- **Mobile**: Slightly smaller font sizes
- **Desktop**: Standard sizes

---

## Icon System

### Icon Library
- **Primary**: Lucide React Icons
- **Size**: 18px to 24px (standard)
- **Color**: Inherits from parent text color or specified

### Common Icons
| Icon | Usage | Size |
|------|-------|------|
| `Home` / `HomeIcon` | Dashboard | 20px |
| `User` | Profile | 20px |
| `Cloud` | Cloud Storage | 20px |
| `Edit` | Resume Editor | 20px |
| `Layout` | Templates | 20px |
| `Briefcase` | Job Tracker | 20px |
| `MessageSquare` | Discussion | 20px |
| `Mail` | Email | 20px |
| `FileText` | Cover Letter | 20px |
| `Globe` | Portfolio | 20px |
| `Bot` | AI Agents | 20px |
| `Sparkles` | Logo/Brand | 20px to 32px |
| `ChevronLeft` / `ChevronRight` | Collapse/Expand | 18px |

### Icon Colors
- **Default**: `secondaryText`
- **Active**: Section color or `primaryBlue`
- **Hover**: Slightly brighter than default

---

## Animation & Transitions

### Global Animation Settings
**Note**: Animations are globally disabled for performance:
```css
animation-duration: 0s !important;
animation-delay: 0s !important;
transition-duration: 0s !important;
transition-delay: 0s !important;
```

### Hover Effects (No Transition)
- **Scale**: Instant `scale(1.01)` to `scale(1.05)`
- **Background**: Instant color change
- **Shadow**: Instant shadow change

### Loading States
- **Spinner**: 12px x 12px, border-4, rounded-full, animate-spin
- **Loading Screen**: Full-screen gradient with fade-in

---

## Specific Component Layouts

### Dashboard Layout

#### Structure
```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (256px) │ Header (Full Height)                  │
│                │                                          │
│ Navigation     │ Content Area (Scrollable)               │
│                │ ┌────────────────────────────────────┐ │
│                │ │ Filter Tags (if any)               │ │
│                │ ├────────────────────────────────────┤ │
│                │ │ Metrics Grid (4 columns)           │ │
│                │ ├──────────────┬──────────────────────┤ │
│                │ │ Left Column  │ Right Column        │ │
│                │ │ (7/8 cols)   │ (5/4 cols)         │ │
│                │ │              │                     │ │
│                │ │ - Todos      │ - Quick Actions     │ │
│                │ │ - Premium    │ - Alerts            │ │
│                │ │ - Activity   │ - Progress         │ │
│                │ │ - Events     │                     │ │
│                │ └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Layout

#### Expanded (256px)
```
┌────────────────────────┐
│ [Logo] RoleReady       │
│      Your Career Hub   │
├────────────────────────┤
│ WORKSPACE              │
│ 🏠 Dashboard            │
│ 👤 Profile              │
│ ☁️  My Files            │
├────────────────────────┤
│ PREPARE                │
│ ✏️  Resume Builder      │
│ 📄 Cover Letter        │
│ 🌐 Portfolio Builder   │
│ 📋 Templates           │
├────────────────────────┤
│ APPLY                  │
│ 🤖 AI Auto-Apply        │
│ 💼 Job Tracker         │
├────────────────────────┤
│ CONNECT                │
│ 📧 Email Hub           │
│ 💬 Community           │
├────────────────────────┤
│ [◀] Collapse           │
└────────────────────────┘
```

#### Collapsed (80px)
```
┌────┐
│[🚀]│
├────┤
│ 🏠 │
│ 👤 │
│ ☁️ │
│ ✏️ │
│ 📄 │
│ 🌐 │
│ 📋 │
│ 🤖 │
│ 💼 │
│ 📧 │
│ 💬 │
├────┤
│ ▶ │
└────┘
```

---

## Special Design Elements

### Gradient Text (RoleReady Logo)
- Background: `linear-gradient(to right, #8B5CF6, #3B82F6)`
- Background clip: `text`
- Text fill: `transparent`
- Display: `inline-block`

### Glassmorphic Effects
- Used extensively in dark mode
- Background: Semi-transparent white (`rgba(255, 255, 255, 0.02)` to `0.05`)
- Backdrop filter: `blur(12px)`
- Border: `rgba(255, 255, 255, 0.1)`
- Shadow: Dark shadows for depth

### Floating Widget Style (Logo)
- Multiple glow rings with blur
- Radial gradients for depth
- Box shadows with colored glows
- Hover: Enhanced glow and slight scale

### Card Hover Effects
- Subtle scale: `1.01` to `1.05`
- Enhanced shadow
- Border color brightening
- Instant (no transition)

---

## Accessibility Considerations

### Contrast Ratios
- **Light Mode**: Text on white meets WCAG AA standards
- **Dark Mode**: Text on dark backgrounds meets WCAG AA standards
- **Focus Indicators**: 3px outline with blue glow

### Touch Targets
- **Minimum Size**: 44px x 44px (mobile)
- **Button Padding**: 12px minimum
- **Icon Size**: 18px minimum with padding

### Keyboard Navigation
- **Focus Visible**: Box shadow outlines
- **Tab Order**: Logical flow
- **Enter/Space**: Activates buttons

---

## Figma Implementation Guide

### Setting Up Color Styles
1. Create color styles for all tokens listed in Color System
2. Name them: `Light/Background`, `Dark/PrimaryText`, etc.
3. Use HSL values where specified for easy theme switching

### Setting Up Text Styles
1. Create text styles for each heading level
2. Include font family, size, weight, line height
3. Create variants for light/dark themes

### Component Library
1. **Buttons**: Create variants for Primary, Secondary, Gradient
2. **Cards**: Standard and Glassmorphic variants
3. **Inputs**: Text input, Select, Textarea
4. **Badges**: All status variants
5. **Navigation Items**: Active and Inactive states

### Effects Library
1. **Shadows**: Create effect styles for each shadow level
2. **Blur**: Create effect styles for backdrop blur
3. **Gradients**: Create gradient styles for all gradients

### Grid System
1. Set up 12-column grid layout
2. Create layout frames matching dashboard structure
3. Use auto-layout for responsive behavior

### Auto-Layout
- Use auto-layout for all components
- Set proper padding and gaps
- Enable "Hug Contents" for flexible sizing

---

## Notes for Designers

1. **Performance First**: Animations are disabled - focus on instant state changes
2. **Dark Mode Priority**: Design system is built for dark mode first
3. **Glassmorphism**: Heavy use of backdrop blur and transparency in dark mode
4. **Subtle Borders**: Very light borders in light mode for clean look
5. **Gradient Accents**: Blue-to-purple gradients are signature brand element
6. **Spacing**: Generous spacing (16px+ between major elements)
7. **Typography**: Inter font family throughout, maintain consistent weights
8. **Icons**: Lucide icons, 18-20px standard size
9. **Responsive**: Mobile-first approach, breakpoints at 640px, 768px, 1024px
10. **Accessibility**: Maintain WCAG AA contrast ratios, 44px touch targets

---

## Component Hierarchy

### Main Layout
```
App Container
├── Sidebar (SidebarNew)
│   ├── Logo Section
│   ├── Navigation Sections
│   │   ├── WORKSPACE
│   │   ├── PREPARE
│   │   ├── APPLY
│   │   └── CONNECT
│   └── Collapse Toggle
├── Header Area
│   ├── DashboardHeader (Dashboard only)
│   ├── PageHeader (Other pages)
│   └── HeaderNew (Resume Editor)
└── Content Area
    ├── DashboardFigma (Dashboard)
    ├── Profile (Profile page)
    ├── CloudStorage (Storage page)
    └── [Other Components]
```

### Dashboard Widget Structure
```
DashboardFigma
├── FilterTags (optional)
├── MetricsGrid
│   └── MetricCard (x4)
└── Main Grid
    ├── Left Column
    │   ├── TodosWidget
    │   ├── PremiumFeaturesWidget
    │   ├── ActivityFeedWidget
    │   └── UpcomingEventsWidget
    └── Right Column
        ├── QuickActionsWidget
        ├── IntelligentAlertsWidget
        └── ProgressMetricsWidget
```

---

## Export Specifications

### Assets Needed
1. **Logo**: SVG format, gradient text effect
2. **Icons**: SVG format, 18-24px standard
3. **Illustrations**: PNG/SVG, for empty states
4. **Backgrounds**: Gradient overlays for hero sections

### Export Settings
- **SVG**: Optimized, viewBox set correctly
- **PNG**: 2x resolution for retina displays
- **Colors**: Export as separate styles/frames

---

## Version History

- **Version 1.0**: Initial comprehensive design system documentation
- **Date**: Created from current codebase analysis
- **Coverage**: Complete design token system, components, layouts, and specifications

---

**End of Design System Report**

This document provides complete specifications to replicate the RoleReady frontend design exactly in Figma. All colors, spacing, typography, components, and effects are documented with exact values and usage guidelines.

