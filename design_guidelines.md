# Design Guidelines: Goal Commitment & Charitable Donation Platform

## Design Approach

**Reference-Based Approach** drawing from:
- **Strava**: For motivational goal tracking and progress visualization
- **GoFundMe/Charity: Water**: For trust-building and charitable organization presentation
- **Duolingo**: For streak tracking and achievement-oriented design
- **Linear**: For clean dashboard aesthetics and task management

**Core Design Principles:**
1. Motivational and inspiring without being preachy
2. Clear accountability through visible progress tracking
3. Build trust around charitable commitments
4. Balance urgency (deadlines) with encouragement
5. Transparent about donations and impact

## Color Palette

**Primary Colors (Dark Mode):**
- Primary Green: 142 76% 36% (commitment, growth, achievement)
- Deep Navy: 222 47% 11% (trust, stability for backgrounds)
- Soft White: 0 0% 98% (text, cards)

**Primary Colors (Light Mode):**
- Primary Green: 142 71% 45%
- Light Background: 210 20% 98%
- Dark Text: 222 47% 20%

**Accent Colors:**
- Warning Orange: 25 95% 53% (deadlines approaching, missed goals)
- Success Teal: 174 72% 56% (completed goals)
- Muted Gray: 220 13% 46% (secondary text, borders)

**Avoid**: Generic purple/blue gradients. Use green as the anchor color for growth and commitment.

## Typography

**Font Families:**
- **Display/Headings**: Inter (700, 600) - clean, modern, authoritative
- **Body/UI**: Inter (400, 500) - consistent, highly readable
- **Numbers/Metrics**: Inter (600, 700) - emphasis on progress data

**Hierarchy:**
- Hero Headline: text-5xl to text-6xl, font-bold
- Section Titles: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl, font-semibold
- Body Text: text-base to text-lg
- Small Details: text-sm

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, and 24
- Component padding: p-6 to p-8
- Section spacing: py-16 to py-24
- Card gaps: gap-6
- Grid gutters: gap-8

**Container Strategy:**
- Dashboard/App: max-w-7xl with px-6 padding
- Marketing sections: max-w-6xl
- Text content: max-w-3xl

## Component Library

### Hero Section (Marketing Page)
Large hero image showing someone achieving a fitness goal or celebrating success
- Full-width background image with dark overlay (opacity-60)
- Centered headline with strong value proposition
- Two-CTA layout: Primary "Start Your First Goal" + Secondary "How It Works"
- Trust indicator: "Over 50,000 goals tracked, $250K+ donated to causes"
- Height: 85vh on desktop, natural height on mobile

### Navigation
- Clean, minimal top bar with logo left, primary CTA right
- Transparent on hero with blur backdrop, solid white/dark on scroll
- Mobile: Hamburger menu with smooth slide-in drawer

### Goal Cards (Dashboard)
- Large, prominent cards with progress visualization
- Top section: Goal title, organization logo/name
- Middle: Circular progress indicator or linear progress bar with percentage
- Bottom: Days remaining, pledge amount, action buttons
- Use rounded-xl borders, subtle shadows
- Green border for active goals, orange for approaching deadline

### Progress Visualization
- Circular progress rings for individual goals (like Apple Watch activity rings)
- Linear progress bars for list views
- Milestone markers showing incremental achievements
- Color transitions from gray → green as progress increases

### Organization Selection
- Grid layout (3 columns on desktop, 1 on mobile)
- Cards with organization logo, name, brief mission statement
- "Verified" badges for trusted organizations
- Hover state: slight elevation, scale effect

### Dashboard Layout
- Left sidebar: Quick stats, active goals count, total donated
- Main area: Goal cards in masonry or grid layout
- Top bar: Create new goal CTA (prominent, always visible)
- Stats widgets: Total goals, completion rate, impact metrics

### Forms (Goal Creation)
- Multi-step wizard: Goal Details → Choose Organization → Set Commitment
- Progress indicator at top showing steps
- Large input fields with clear labels
- Date picker for deadline
- Money input with currency symbol
- Preview panel showing final commitment before confirmation

### Marketing Page Sections

**How It Works (3-column grid)**
- Step 1: Set Your Goal (icon + title + description)
- Step 2: Choose a Cause (icon + title + description)
- Step 3: Make Your Commitment (icon + title + description)
Use icons from Heroicons (outline style)

**Featured Organizations (4-column grid)**
- Real organization logos and names
- Brief impact statement
- "Learn More" links

**Social Proof / Testimonials (2-column)**
- User photo, name, goal achieved, quote
- Organization supported highlighted
- Actual impact numbers (e.g., "$500 donated to clean water")

**Stats Section (4-column centered)**
- Total goals tracked
- Success rate percentage
- Total donated
- Organizations supported
Bold numbers with descriptions below

**CTA Section**
- Full-width, green background
- Strong headline: "Turn Your Goals Into Impact"
- Primary button + supporting text
- No images, pure focus on action

### Footer
- Multi-column layout: About, Organizations, Resources, Legal
- Newsletter signup (optional, only if adds value)
- Social links
- Trust badges: Secure payments, verified charities

## Animations

**Minimal and purposeful:**
- Progress ring animations when viewing goal details (smooth fill)
- Card hover: subtle lift (translate-y-1)
- Button interactions: scale on click
- Page transitions: simple fade
- Success confetti burst ONLY when goal is completed
**Do not** add scroll animations, parallax, or distracting effects

## Images

**Required Images:**
1. **Hero Image**: Someone achieving a fitness goal - running, crossing finish line, or celebrating completion. Shows determination and success. Full-width, high quality.
2. **Organization Logos**: Placeholder logos for charitable organizations (wildlife conservation, education, health, environment)
3. **Testimonial Photos**: Authentic user profile images showing diverse users
4. **How It Works Section**: Optional small illustrations or icons to support each step

**Image Treatment:**
- Hero: Dark overlay for text readability
- Organization logos: Consistent sizing, padding
- User photos: Circular crops for testimonials

## Key UX Patterns

- **Commitment emphasis**: Always show both the goal AND the donation amount together
- **Deadline visibility**: Clear countdown timers, color-coded urgency
- **Progress first**: Dashboard leads with progress, not settings
- **Trust signals**: Verified organizations, secure payment badges, real impact numbers
- **Positive reinforcement**: Celebrate completions, gentle reminders for deadlines
- **Transparency**: Show exactly where money goes, how it helps

This design balances motivation with accountability, using clean modern aesthetics inspired by fitness and productivity apps while building trust through charitable platform patterns.