# RoleReady Workflow Automation - Figma Design Specification
## Complete UI/UX Design System - Production Ready

> **Version:** 1.0  
> **Date:** November 12, 2025  
> **Status:** Ready for Figma Implementation  
> **Figma File Structure:** Single file with organized pages

---

## 📐 Design System Foundation

### Color Palette (Copy-paste into Figma)

```
PRIMARY COLORS:
#3B6EA5  Primary-500    Main brand, buttons, links
#1E4D8B  Primary-700    Button hover, dark text
#0A2463  Primary-900    Headers, emphasis
#6B9ED4  Primary-300    Hover states, light accent
#D4E5F7  Primary-100    Backgrounds, cards

NEUTRAL COLORS:
#1A1A1A  Neutral-900    Body text
#4A4A4A  Neutral-700    Secondary text
#757575  Neutral-500    Disabled text
#BDBDBD  Neutral-300    Borders
#F5F5F5  Neutral-100    Light backgrounds
#FAFAFA  Neutral-50     Card backgrounds
#FFFFFF  White          Pure white

SEMANTIC COLORS:
#2E7D32  Success-500    Success states
#C8E6C9  Success-100    Success backgrounds
#F57C00  Warning-500    Warning states
#FFE0B2  Warning-100    Warning backgrounds
#D32F2F  Error-500      Error states
#FFCDD2  Error-100      Error backgrounds

WORKFLOW STATUS:
#4CAF50  Status-Active  Workflow running
#9E9E9E  Status-Idle    Workflow idle
#FFC107  Status-Working Agent thinking
#F44336  Status-Error   Error state
```

### Typography Scale

```
FONT FAMILY:
Primary: Inter (Google Fonts)
Monospace: JetBrains Mono

FONT SIZES:
12px  xs      Labels, captions
14px  sm      Helper text, small UI
16px  base    Body text (default)
18px  lg      Emphasized text
20px  xl      Small headings
24px  2xl     Section headings
30px  3xl     Page headings
36px  4xl     Hero text

FONT WEIGHTS:
400  Regular
500  Medium
600  Semibold
700  Bold

LINE HEIGHT:
1.25  Tight (headings)
1.5   Normal (body)
1.75  Relaxed (long form)

LETTER SPACING:
-0.025em  Tight
0         Normal
0.025em   Wide
```

### Spacing System (8px Grid)

```
0px   space-0
4px   space-1
8px   space-2
12px  space-3
16px  space-4
20px  space-5
24px  space-6
32px  space-8
40px  space-10
48px  space-12
64px  space-16
```

### Border Radius

```
0px    none
4px    sm      Small elements
8px    base    Buttons, inputs
12px   lg      Cards
16px   xl      Large cards
24px   2xl     Modals
9999px full    Pills, avatars
```

### Shadows

```
0 1px 2px rgba(0,0,0,0.05)      shadow-sm
0 2px 8px rgba(0,0,0,0.08)      shadow-base
0 4px 16px rgba(0,0,0,0.1)      shadow-md
0 8px 32px rgba(0,0,0,0.12)     shadow-lg
0 16px 48px rgba(0,0,0,0.15)    shadow-xl
```

---

## 🧩 Component Library

### 1. Button - Primary

**Frame:** 40px height (auto-width based on content)

```
DEFAULT STATE:
Background: #3B6EA5
Text: #FFFFFF
Font: 16px, Medium (500)
Padding: 0 24px (vertical auto-center)
Border-radius: 8px
Shadow: 0 2px 8px rgba(0,0,0,0.08)

HOVER STATE:
Background: #1E4D8B
Shadow: 0 4px 16px rgba(0,0,0,0.1)
Transform: translateY(-1px)

ACTIVE STATE:
Background: #0A2463
Shadow: 0 1px 2px rgba(0,0,0,0.05)
Transform: translateY(0)

DISABLED STATE:
Background: #BDBDBD
Text: #757575
Cursor: not-allowed
Shadow: none

SIZES:
Small:  32px height, 12px 20px padding, 14px text
Medium: 40px height, 16px 24px padding, 16px text (default)
Large:  48px height, 16px 32px padding, 18px text

VARIANTS (Create in Figma):
- Primary (background)
- Secondary (border only)
- Ghost (no background)
```

**Figma Setup:**
1. Create component "Button/Primary"
2. Add variants: Size [S, M, L], State [Default, Hover, Active, Disabled]
3. Use auto-layout (horizontal, padding 24px, center aligned)

---

### 2. Input Field

**Frame:** 48px height, flexible width

```
DEFAULT:
Background: #FFFFFF
Border: 1px solid #BDBDBD
Padding: 0 16px
Font: 16px, Regular
Color: #1A1A1A
Border-radius: 8px
Placeholder color: #757575

FOCUS:
Border: 2px solid #3B6EA5
Shadow: 0 0 0 4px rgba(59,110,165,0.1)

ERROR:
Border: 1px solid #D32F2F
Helper text color: #D32F2F

DISABLED:
Background: #F5F5F5
Border: 1px solid #BDBDBD
Text: #757575
```

**With Label:**
```
Label above: 8px gap
Label: 14px, Medium (500), #4A4A4A
Helper below: 4px gap
Helper: 12px, Regular, #757575 or #D32F2F
```

**Figma Setup:**
1. Create component "Input"
2. Variants: State [Default, Focus, Error, Disabled], With Label [True, False]
3. Use auto-layout (vertical, gap 8px for label)

---

### 3. Workflow Node (Canvas Element)

**Frame:** 120px width × 80px height

```
STRUCTURE:
┌─────────────────┐
│  [Icon 24×24]   │  Centered, 8px from top
│  Node Name      │  14px, Medium, centered
│  (Node Type)    │  12px, Regular, #757575
└─────────────────┘

Background: #FFFFFF
Border: 2px solid #BDBDBD
Border-radius: 12px
Shadow: 0 2px 8px rgba(0,0,0,0.08)
Padding: 16px

HOVER:
Border: 2px solid #3B6EA5
Shadow: 0 4px 16px rgba(0,0,0,0.1)

SELECTED:
Border: 2px solid #0A2463
Background: #D4E5F7
Shadow: 0 4px 16px rgba(59,110,165,0.2)

RUNNING:
Border: 2px solid #4CAF50
Pulse animation

ERROR:
Border: 2px solid #F44336
Icon color: #F44336
```

**Node Types with Colors:**
```
Trigger:   #9C27B0  Purple
AI Agent:  #2196F3  Blue
Logic:     #FF9800  Orange
Action:    #4CAF50  Green
Database:  #607D8B  Blue Grey
```

**Connection Line:**
```
Width: 2px
Color: #BDBDBD
Style: Solid (or dashed for conditional)
End: Arrow (8px)
```

**Figma Setup:**
1. Component "Node/Base" with variants for Type and State
2. Connection line as separate component
3. Use constraints for responsive canvas

---

### 4. Workflow Canvas

**Layout:** 1440px × 900px viewport (scrollable)

```
CANVAS AREA:
Background: #FAFAFA
Grid: 20px × 20px dots (#E0E0E0)
Snap to grid: enabled

TOOLBAR (Top):
Height: 60px
Background: #FFFFFF
Border-bottom: 1px solid #E0E0E0
Padding: 0 24px

Controls:
[Zoom -] [100%] [Zoom +] [Fit to Screen] [Save] [Run] [Settings]

SIDEBAR (Left):
Width: 280px
Background: #FFFFFF
Border-right: 1px solid #E0E0E0

NODE PALETTE:
Sections with 8px gap between
Nodes draggable
Each node: 120px × 60px mini preview

PROPERTIES PANEL (Right):
Width: 320px
Background: #FFFFFF
Border-left: 1px solid #E0E0E0
Padding: 24px
Scrollable

MINIMAP (Bottom Right):
Width: 200px
Height: 150px
Background: rgba(255,255,255,0.9)
Border: 1px solid #BDBDBD
Position: Fixed bottom-right, 16px margins
```

---

### 5. Job Card (in Results)

**Frame:** Flexible width (min 300px), auto height

```
STRUCTURE:
┌────────────────────────────────────────┐
│ 🏢 Job Title                    ⭐ 92% │  24px height
│ Company Name                           │  18px height
│ 💰 $120K-$150K  📍 Remote  ⏰ 2d ago  │  16px height
│                                        │
│ [Details] [Apply] [Save]              │  32px buttons
└────────────────────────────────────────┘

Padding: 20px
Background: #FFFFFF
Border: 1px solid #E0E0E0
Border-radius: 12px
Gap between elements: 8px
Shadow: 0 2px 8px rgba(0,0,0,0.08)

HOVER:
Border: 1px solid #3B6EA5
Shadow: 0 4px 16px rgba(0,0,0,0.1)
Transform: translateY(-2px)

MATCH SCORE BADGE:
Position: Top-right
Size: 48px × 24px
Background: Gradient based on score
  90-100%: linear-gradient(135deg, #4CAF50, #66BB6A)
  70-89%:  linear-gradient(135deg, #2196F3, #42A5F5)
  50-69%:  linear-gradient(135deg, #FFC107, #FFD54F)
Font: 14px, Bold, #FFFFFF
Border-radius: 12px
```

**Figma Setup:**
1. Component "JobCard"
2. Auto-layout (vertical, gap 8px)
3. Resizing: Hug contents vertically, Fill horizontally

---

### 6. Message Bubble (Chat Interface)

**User Message:**
```
Max-width: 70%
Align: Right
Background: #3B6EA5
Color: #FFFFFF
Padding: 12px 16px
Border-radius: 16px 16px 4px 16px
Font: 16px, Regular
Line-height: 1.5
Margin-bottom: 16px
```

**Agent Message:**
```
Max-width: 80%
Align: Left
Background: #FAFAFA
Color: #1A1A1A
Padding: 16px
Border-radius: 16px 16px 16px 4px
Border-left: 3px solid #3B6EA5
Font: 16px, Regular
Line-height: 1.75
Margin-bottom: 16px

WITH ACTION BUTTONS:
Add 12px gap below message
Buttons: Horizontal flex, 8px gap
Button: 32px height, 12px 16px padding
```

**Figma Setup:**
1. Component "Message/User" and "Message/Agent"
2. Variants: WithActions [True, False]
3. Auto-layout for actions

---

### 7. Status Badge

**Frame:** Auto-width × 24px height

```
ACTIVE:
Background: #C8E6C9
Text: #2E7D32
Icon: ● (8px circle, #2E7D32)

IDLE:
Background: #F5F5F5
Text: #757575
Icon: ● (8px circle, #9E9E9E)

WORKING:
Background: #FFF3CD
Text: #F57C00
Icon: ● (8px circle, #FFC107, pulse animation)

ERROR:
Background: #FFCDD2
Text: #D32F2F
Icon: ● (8px circle, #F44336)

Padding: 4px 12px
Border-radius: 9999px
Font: 12px, Medium
Gap between icon and text: 6px
```

---

### 8. Modal Dialog

**Frame:** 600px width (medium), 800px (large)

```
STRUCTURE:
┌──────────────────────────────┐
│ ┌────────────────────────┐   │  Header: 60px
│ │ [Icon] Title      [×]  │   │
│ └────────────────────────┘   │
│                              │
│ Content Area (scrollable)    │  Flexible height
│ Padding: 24px                │
│                              │
│ ┌────────────────────────┐   │  Footer: 72px
│ │ [Cancel] [Primary]     │   │
│ └────────────────────────┘   │
└──────────────────────────────┘

Background: #FFFFFF
Border-radius: 24px
Shadow: 0 16px 48px rgba(0,0,0,0.15)
Max-height: 90vh

BACKDROP:
Background: rgba(0,0,0,0.5)
Backdrop-filter: blur(4px)

HEADER:
Padding: 20px 24px
Border-bottom: 1px solid #E0E0E0
Title: 20px, Semibold

FOOTER:
Padding: 16px 24px
Border-top: 1px solid #E0E0E0
Buttons: Right-aligned, 8px gap
```

---

### 9. Notification Toast

**Frame:** Min 320px, Max 480px width × Auto height

```
STRUCTURE:
┌─────────────────────────────┐
│ [Icon] Title           [×]  │  Top row
│        Message text         │  Bottom row
│        [Action] [Dismiss]   │  Optional actions
└─────────────────────────────┘

Padding: 16px
Background: #FFFFFF
Border-radius: 12px
Border-left: 4px solid [semantic color]
Shadow: 0 16px 48px rgba(0,0,0,0.15)
Position: Fixed top-right, 16px from edges

SUCCESS: Border #2E7D32, Icon checkmark
ERROR: Border #D32F2F, Icon X
WARNING: Border #F57C00, Icon alert
INFO: Border #2196F3, Icon info

Animation:
Enter: Slide right + fade (300ms)
Exit: Slide right + fade (200ms)
Auto-dismiss: 5 seconds
```

---

### 10. Progress Indicator

**Linear Bar:**
```
Height: 4px
Width: 100%
Background: #E0E0E0
Border-radius: 2px

Progress Fill:
Background: #3B6EA5
Border-radius: 2px
Animation: Indeterminate (slide left-right)
```

**Circular Spinner:**
```
Size: 20px
Border: 2px solid #E0E0E0
Border-top: 2px solid #3B6EA5
Border-radius: 50%
Animation: Rotate 360deg, 0.8s linear infinite
```

---

## 📱 Screen Layouts

### Layout 1: Workflow Builder (Desktop)

**Viewport:** 1440px × 900px

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Workflow Builder    [@User] [⚙️] [🔔3]         │ 60px
├────────┬────────────────────────────────────────────────────┤
│        │                                                     │
│  Node  │              Canvas Area                           │
│ Library│          (Drag & drop nodes)                       │
│        │                                                     │
│ 280px  │                1160px                              │
│        │                                                     │
│        │                                                     │
│        │                                                     │
│        │                                                     │
│        │                                                     │
│        ├─────────────────────────────────────────────────────┤
│        │ [Execution Status Bar]                        120px│
└────────┴──────────────────────────────────────────────────────┘

HEADER (60px):
Background: #FFFFFF
Border-bottom: 1px solid #E0E0E0
Padding: 0 24px
Flex: space-between, center aligned

LEFT SIDEBAR (280px):
Background: #FAFAFA
Border-right: 1px solid #E0E0E0
Padding: 20px
Scrollable

Sections:
- Triggers (collapsed/expanded)
- AI Agents
- Logic Nodes
- Actions
Each section: 8px gap between items

CANVAS (1160px × 720px):
Background: #FAFAFA
Grid: 20px dots
Scrollable: Both directions
Zoom: 25% to 200%

BOTTOM BAR (120px):
Background: #FFFFFF
Border-top: 1px solid #E0E0E0
Padding: 16px 24px

Shows when workflow running:
[Node Progress] [Logs] [Stop] [Pause]
```

---

### Layout 2: Job Tracker Dashboard

**Viewport:** 1440px × 900px

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Job Tracker                [@User] [⚙️] [🔔]    │ 60px
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │   23     │ │   18%    │ │  9 days  │ │    3     │       │ Stats
│ │ Applied  │ │ Response │ │ Avg Time │ │Interview │       │ Row
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ 120px
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Filters: [All] [Discovered] [Applied] [Interview]      │ │ 48px
│ │ Search: [_________________] [Sort by: Date ▼]          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Job Tracker Table                                       │ │
│ ├──────┬──────────┬────────┬─────────┬─────────┬────────┤ │ Table
│ │Title │ Company  │ Match  │ Salary  │ Status  │Actions │ │ Header
│ ├──────┼──────────┼────────┼─────────┼─────────┼────────┤ │ 40px
│ │Row 1 │          │        │         │         │        │ │
│ │Row 2 │          │        │         │         │        │ │ Rows
│ │Row 3 │          │        │         │         │        │ │ 60px
│ │...   │          │        │         │         │        │ │ each
│ └──────┴──────────┴────────┴─────────┴─────────┴────────┘ │
│                                                              │
│ [Pagination: 1 2 3 ... 10] [50 per page ▼]                 │ 48px
└─────────────────────────────────────────────────────────────┘

PADDING:
Page container: 32px all sides
Gaps between sections: 24px

STAT CARDS:
Width: Equal (4 columns, gap 16px)
Height: 120px
Padding: 20px
Border-radius: 12px
Background: #FFFFFF
Shadow: 0 2px 8px rgba(0,0,0,0.08)

TABLE:
Background: #FFFFFF
Border-radius: 12px
Shadow: 0 2px 8px rgba(0,0,0,0.08)
Header background: #FAFAFA
Row hover: #F5F5F5
```

---

### Layout 3: Mobile Workflow Status

**Viewport:** 375px × 812px (iPhone X)

```
┌────────────────────────┐
│ ← Workflows     [☰]    │ 56px header
├────────────────────────┤
│                        │
│ Daily Job Hunt         │ 32px title
│ ● Running              │ 16px status
│                        │
│ Progress: 60%          │ 24px
│ [████████░░]           │ 8px bar
│                        │
│ ┌────────────────────┐ │
│ │ ✓ Scrape LinkedIn  │ │ Node
│ │   2.3s             │ │ Card
│ └────────────────────┘ │ 72px
│                        │
│ ┌────────────────────┐ │
│ │ ⏳ Match Scoring   │ │
│ │   Running...       │ │
│ └────────────────────┘ │
│                        │
│ ┌────────────────────┐ │
│ │ ⏸ Filter Jobs      │ │
│ │   Waiting...       │ │
│ └────────────────────┘ │
│                        │
│ [Pause] [Stop] [Logs]  │ 48px actions
│                        │
├────────────────────────┤
│[🏠][📊][💬][👤]      │ 72px bottom nav
└────────────────────────┘

HEADER:
Height: 56px
Padding: 0 16px
Background: #FFFFFF
Shadow: 0 2px 8px rgba(0,0,0,0.08)

CONTENT:
Padding: 16px
Gap between cards: 12px

NODE CARDS:
Padding: 16px
Border-radius: 12px
Background: #FFFFFF
Border: 1px solid #E0E0E0

BOTTOM NAV:
Height: 72px
Background: #FFFFFF
Border-top: 1px solid #E0E0E0
Icons: 24px, centered
Active: #3B6EA5
Inactive: #9E9E9E
```

---

### Layout 4: Job Detail Modal

**Overlay:** Full viewport with backdrop

```
┌─────────────────────────────────────────────┐
│ [×] Senior Software Engineer @ Netflix      │ 60px
├─────────────────────────────────────────────┤
│                                             │
│ ⭐ 92% Match                                │
│ 💰 $150K-$180K  📍 Remote  ⏰ Posted 2d ago│ 24px
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ 🏢 Company Research                     ││ Tab
│ │ 💼 Salary Details                       ││ Section
│ │ 🌐 Networking (3 contacts)              ││ 48px
│ └─────────────────────────────────────────┘│
│                                             │
│ [COMPANY RESEARCH TAB CONTENT]              │ Scrollable
│                                             │ Content
│ Company Overview:                           │
│ Netflix is a streaming...                   │
│                                             │
│ Recent News:                                │
│ • Launched new AI features                  │
│ • Revenue up 25%                           │
│                                             │
│ Tech Stack:                                 │
│ [React] [Node.js] [AWS] [Docker]          │
│                                             │
│ Key Insights:                               │
│ • Your skills match 95% of their stack     │
│ • 3 alumni work here                       │
│ • Salary is 85th percentile                │
│                                             │
├─────────────────────────────────────────────┤
│ [Save for Later] [Apply Now]               │ 72px
└─────────────────────────────────────────────┘

WIDTH: 800px
MAX HEIGHT: 90vh
PADDING: 24px
BORDER-RADIUS: 24px
SHADOW: 0 16px 48px rgba(0,0,0,0.15)

TABS:
Height: 48px
Padding: 12px 24px each
Active: Border-bottom 3px solid #3B6EA5
Inactive: #757575

CONTENT:
Padding: 24px
Gap: 16px between sections
Scrollable
```

---

## 📊 Workflow Visualization

### Canvas Node Arrangement

**Automated Daily Job Hunt - Visual Layout:**

```
LAYER 1 (Top):
┌─────────┐
│ ⏰      │  (360px from top, 720px from left)
│Schedule │
└────┬────┘
     │ 40px vertical gap
     
LAYER 2:
┌─────────┐
│ 📋      │  (440px from top, 720px from left)
│Settings │
└────┬────┘
     │ 40px vertical gap
     
LAYER 3 (Parallel):
┌─────────┐  ┌─────────┐  ┌─────────┐
│LinkedIn │  │Indeed   │  │Glassdoor│
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
(520px top)  (520px top)  (520px top)
(560px left) (720px left) (880px left)
     │ 60px gaps between
     
LAYER 4:
     └────────┬───────────┘
         ┌────▼────┐
         │Merge    │  (660px from top, 720px from left)
         └────┬────┘
              │ 40px gap
              
LAYER 5:
         ┌────▼────┐
         │AI Match │  (740px from top, 720px from left)
         └────┬────┘
              │ 40px gap

Continue pattern...

NODE SIZE: 120px × 80px
VERTICAL GAP: 40px (standard), 60px (after parallel)
HORIZONTAL GAP: 160px (parallel nodes)
CONNECTION LINE: 2px, #BDBDBD, with arrow
```

---

## 🎨 Figma File Organization

### Page Structure

```
📄 00_COVER
   - Project title
   - Design system version
   - Last updated
   - Contributors

📄 01_DESIGN_TOKENS
   ├─ Colors (all swatches with codes)
   ├─ Typography (text styles)
   ├─ Spacing (grid examples)
   ├─ Shadows (layer styles)
   └─ Icons (24×24 icon set)

📄 02_COMPONENTS
   ├─ Atoms
   │  ├─ Buttons (all variants)
   │  ├─ Inputs (all states)
   │  ├─ Badges
   │  └─ Icons
   ├─ Molecules
   │  ├─ Cards
   │  ├─ Form Groups
   │  └─ List Items
   └─ Organisms
      ├─ Navigation
      ├─ Workflow Node
      └─ Modal

📄 03_SCREENS_DESKTOP
   ├─ Workflow Builder
   ├─ Job Tracker
   ├─ Dashboard
   └─ Settings

📄 04_SCREENS_MOBILE
   ├─ Home
   ├─ Workflow Status
   ├─ Job List
   └─ Profile

📄 05_WORKFLOWS
   ├─ Daily Job Hunt (canvas view)
   ├─ Follow-up System
   └─ Interview Prep

📄 06_PROTOTYPE
   - Linked screens for testing
```

---

## 📏 Component Specifications (Exact Measurements)

### Workflow Node - Complete Spec

```yaml
COMPONENT: WorkflowNode
SIZE: 120×80px

LAYERS:
1. Background (Frame)
   - Fill: #FFFFFF
   - Stroke: 2px, #BDBDBD
   - Corner radius: 12px
   - Shadow: 0 2px 8px rgba(0,0,0,0.08)

2. Icon (Vector/Icon)
   - Size: 24×24px
   - Position: Center-X, 12px from top
   - Color: Based on node type

3. Title (Text)
   - Position: Center-X, 44px from top
   - Font: Inter, Medium, 14px
   - Color: #1A1A1A
   - Max-width: 104px (truncate...)
   - Align: Center

4. Subtitle (Text)
   - Position: Center-X, 62px from top
   - Font: Inter, Regular, 12px
   - Color: #757575
   - Max-width: 104px
   - Align: Center

5. Status Indicator (Optional)
   - Size: 12×12px circle
   - Position: Bottom-right, -4px offset
   - Colors: Success #4CAF50, Error #F44336, Working #FFC107

AUTO-LAYOUT:
- Direction: Vertical
- Padding: 12px 8px
- Gap: 4px
- Alignment: Center
- Resizing: Fixed size

VARIANTS:
Type: [Trigger, AI, Logic, Action, Database]
State: [Default, Hover, Selected, Running, Error]
```

### Button - Complete Spec

```yaml
COMPONENT: Button/Primary/Medium
SIZE: Auto-width × 40px

LAYERS:
1. Background (Frame)
   - Fill: #3B6EA5
   - Corner radius: 8px
   - Shadow: 0 2px 8px rgba(0,0,0,0.08)

2. Text (Text)
   - Font: Inter, Medium, 16px
   - Color: #FFFFFF
   - Letter spacing: 0

AUTO-LAYOUT:
- Direction: Horizontal
- Padding: 0 24px (vertical auto)
- Gap: 8px (if icon present)
- Alignment: Center
- Resizing: Hug contents

VARIANTS:
Size: [Small 32px, Medium 40px, Large 48px]
State: [Default, Hover, Active, Disabled]
Icon: [None, Left, Right, Only]
Type: [Primary, Secondary, Ghost]

INTERACTIVE:
Hover: Change fill to #1E4D8B, shadow to shadow-md
Active: Change fill to #0A2463, shadow to shadow-sm
```

### Input Field - Complete Spec

```yaml
COMPONENT: Input/Default
SIZE: Flexible width × 48px

LAYERS:
1. Background (Frame)
   - Fill: #FFFFFF
   - Stroke: 1px, #BDBDBD
   - Corner radius: 8px

2. Placeholder (Text)
   - Font: Inter, Regular, 16px
   - Color: #757575
   - Padding: 0 16px

3. Value (Text) - Hidden by default
   - Font: Inter, Regular, 16px
   - Color: #1A1A1A
   - Padding: 0 16px

AUTO-LAYOUT:
- Direction: Horizontal
- Padding: 0 16px
- Height: 48px
- Alignment: Left, vertical center
- Resizing: Fill container horizontally

VARIANTS:
State: [Default, Focus, Error, Disabled]
HasLabel: [True, False]
HasIcon: [None, Left, Right]

FOCUS STATE:
- Stroke: 2px, #3B6EA5
- Add shadow: 0 0 0 4px rgba(59,110,165,0.1)

WITH LABEL (Vertical auto-layout):
- Gap: 8px
- Label: 14px, Medium, #4A4A4A
- Helper text: 12px, Regular, #757575 (4px below input)
```

---

## 📱 Responsive Breakpoints

```
MOBILE:     375px - 767px
TABLET:     768px - 1023px
DESKTOP:    1024px - 1439px
WIDE:       1440px+

LAYOUT ADJUSTMENTS:

Mobile (375px):
- Single column
- Full-width components
- Bottom navigation
- Collapsible sections
- 16px padding

Tablet (768px):
- 2-column grid
- Side navigation (collapsible)
- 24px padding
- Cards in rows of 2

Desktop (1024px):
- 3-column grid (or 2 + sidebar)
- Persistent sidebar
- 32px padding
- Cards in rows of 3

Wide (1440px):
- 4-column grid (or 3 + sidebar)
- Max-width containers
- 48px padding
- Utilize extra space for detail panels
```

---

## 🎯 Implementation Checklist

### Phase 1: Setup (2 hours)
```
□ Create Figma file
□ Set up color styles (copy from above)
□ Set up text styles (11 styles)
□ Import Inter font
□ Create 8×8 grid
□ Set up shadow styles
```

### Phase 2: Components (1 day)
```
□ Button component (all variants)
□ Input component (all states)
□ Workflow node (all types)
□ Job card
□ Message bubble
□ Status badge
□ Modal dialog
□ Toast notification
□ Progress indicators
```

### Phase 3: Layouts (2 days)
```
□ Workflow builder screen
□ Job tracker dashboard
□ Mobile workflow status
□ Job detail modal
□ Settings screen
```

### Phase 4: Workflows (1 day)
```
□ Daily job hunt canvas
□ Follow-up workflow
□ Interview prep workflow
□ Node connections and arrows
```

### Phase 5: Prototype (1 day)
```
□ Link screens together
□ Add interactions
□ Add transitions
□ Test user flows
□ Export for developers
```

---

## 📤 Export Settings

```
ICONS:
Format: SVG
Size: 24×24px
Export: @1x, @2x, @3x
Naming: icon-[name]-24.svg

COMPONENTS:
Format: SVG (vectors), PNG (rasters)
Export: @1x, @2x, @3x
Naming: component-[name]-[variant].svg

SCREENS:
Format: PNG (preview), PDF (specs)
Resolution: @2x
Naming: screen-[name]-[size].png

WORKFLOW DIAGRAMS:
Format: SVG
Export: Full canvas
Naming: workflow-[name].svg
```

---

## 🚀 Quick Start Guide

### 1. Create New Figma File
```
File → New design file
Name: "RoleReady Workflow Automation"
```

### 2. Set Up Styles (15 minutes)
```
Right sidebar → Local styles

COLORS:
Create color styles for:
- All 8 primary colors
- All 7 neutral colors
- All 6 semantic colors
- All 4 status colors

TEXT STYLES:
Create text styles for:
- Heading 1 (30px, Semibold)
- Heading 2 (24px, Semibold)
- Heading 3 (20px, Semibold)
- Body (16px, Regular)
- Body Bold (16px, Semibold)
- Small (14px, Regular)
- Caption (12px, Regular)

EFFECTS (Shadows):
Create effect styles for:
- shadow-sm
- shadow-base
- shadow-md
- shadow-lg
- shadow-xl
```

### 3. Create First Component (30 minutes)
```
Create frame: 40px × Auto
Add text layer: "Button"
Apply: Primary-500 fill, white text
Set padding: 0 24px
Add border-radius: 8px
Convert to component: Cmd+Option+K
Create variants for states
```

### 4. Build First Screen (1 hour)
```
Create frame: 1440×900px
Add header (60px)
Add sidebar (280px)
Add canvas area
Place sample nodes
Connect with lines
Add toolbar controls
```

---

## 💡 Pro Tips

1. **Use Auto-layout Everywhere**
   - Makes components responsive
   - Easier to maintain
   - Faster iterations

2. **Component Variants > Multiple Components**
   - Easier to update
   - Consistent sizing
   - Better organization

3. **Name Layers Clearly**
   - "Button/Primary/Medium/Default"
   - Developers will thank you

4. **Use Constraints**
   - Make responsive layouts
   - Test different sizes
   - Less manual adjustment

5. **Test on Real Sizes**
   - Use device frames
   - Test mobile flows
   - Check readability

---

## 📋 Design Tokens Export (For Developers)

```javascript
// colors.js
export const colors = {
  primary: {
    900: '#0A2463',
    700: '#1E4D8B',
    500: '#3B6EA5',
    300: '#6B9ED4',
    100: '#D4E5F7',
  },
  neutral: {
    900: '#1A1A1A',
    700: '#4A4A4A',
    500: '#757575',
    300: '#BDBDBD',
    100: '#F5F5F5',
    50: '#FAFAFA',
  },
  success: {
    500: '#2E7D32',
    100: '#C8E6C9',
  },
  // ... rest of colors
};

// typography.js
export const typography = {
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// spacing.js
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};
```

---

## ✅ Final Checklist Before Handoff

```
DESIGN SYSTEM:
□ All colors defined and styled
□ All text styles created
□ Spacing system documented
□ Shadow styles created
□ Border radius values set

COMPONENTS:
□ All components created
□ All variants defined
□ All states covered
□ Auto-layout applied
□ Constraints set
□ Named clearly

SCREENS:
□ All key screens designed
□ Responsive layouts tested
□ Interactions defined
□ Prototype connected
□ Annotations added

DOCUMENTATION:
□ Component specs documented
□ Design tokens exported
□ Developer handoff notes
□ Assets exported
□ Figma shared with team

QUALITY:
□ Consistent spacing
□ Aligned elements
□ Proper contrast ratios
□ Accessible colors
□ Readable text sizes
```

---

**This is your complete, production-ready Figma specification. Every measurement, every color code, every component is precisely defined. Start building! 🚀**

**Document Status:** ✅ Complete and Ready for Implementation  
**Last Updated:** November 12, 2025  
**Version:** 1.0 - Production Ready

