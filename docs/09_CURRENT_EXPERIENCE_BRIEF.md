# Current Experience Brief

**Status:** Current Home redesign. The entrance and the interactive portrait are distinct scenes.  
**Decision date:** 2026-11-20  
**Purpose:** Source of truth for the next redesign of the portfolio opening, visual identity, language, page flow, and closing scene.

## Precedence

This brief records the user's latest decisions. It supersedes earlier conflicting details in `00_MASTER_PRD.md`, `02_ENGINEERING_GUIDELINES.md`, `03_MOTION_SYSTEM.md`, `06_IMPLEMENTATION_ROADMAP.md`, and `08_AI_CONTEXT.md` for the topics covered here: brand name, home introduction, interaction model, initial site language, page flow, and footer concept. General requirements for originality, accessibility, performance, and maintainability remain in force.

When implementation begins, read this brief first, then inspect the current code and the relevant Next.js 16 documentation under `node_modules/next/dist/docs/` before writing code.

## Product Direction

Create a distinctive, English-first portfolio with a cinematic, interactive opening. The visitor should experience a fictional biometric identity scan that reveals a complete holographic portrait and the author's visual identity, then flows into the portfolio content.

The reference sites inform separate parts of the experience:

- [Mowa Studio](https://mowa.studio/) informs the pacing and hierarchy of the page flow. It is not a reference for this portfolio's intro animation or visual identity.
- [JJettas](https://jjettas.com/) informs the logo-led opening and central portrait reveal. Extract the principle; do not reproduce its layout, logo, or animation.
- `C:\Users\natan\Downloads\designedby-russ-3d-website-guide.pdf` informs the production method: define scroll beats first, map scroll to a reversible timeline, keep interface copy as HTML, and plan model, fallback, performance, and mobile behavior before implementation.

## Decisions Locked So Far

### Brand

- Exact wordmark: **`odevntzn`**, lowercase.
- Approved logo: the abstract, faceted animated symbol and lowercase wordmark in `public/brand/odevntzn-nucleo-animado.svg`. Three facets close around a triangular core, then reveal `odevntzn`.
- Use holographic treatment as a material and animation language: mesh facets, scan lines, restrained glow, and depth.
- Core palette: black, white, and the existing lime signal `#C8FF70`. The current near-black token is `#050605`; retain the existing palette tokens where they support this direction.
- The supplied SVG includes a 2.4-second CSS reveal, a black background, white mark/type, a lime pulse, and a reduced-motion rule. Preserve those behaviors when integrating it.
- The symbol and wordmark must remain recognizable without glow or animation and work at small sizes. Check a symbol-only version for favicon and compact navigation use.

### Language

- The first release is entirely in English: navigation, interface labels, project copy, accessibility labels, and metadata.
- Portuguese translation is a later phase. Keep copy organized so it can be localized, but do not expose mixed Portuguese/English in the first release.

### Page Flow

Use Mowa's clear progression as a structural reference, adapted to a personal portfolio: brand-led opening, concise positioning, selected work surfaced early, about/capabilities, and contact. Keep the site's own project content and workspace identity; do not copy Mowa's agency sections or visual design.

## Opening sequence

1. Render a black curtain across the entire viewport. Animate the approved faceted logo at its center while the first portrait and fonts load.
2. Lift the whole curtain upward to uncover the portfolio. Opening the page starts this transition automatically. Include a skip action and a reduced-motion path.
3. Reveal Natan's name and a frameless holographic bust. Scrolling and dragging change the view. Use the portrait's depth and silhouette as the visual focus.
4. Move into the light project gallery. Present each product with its own art direction and preserve its actual contribution and destination.
5. Close on a full-body projection, robots and a direct invitation to contact Natan.

Current Home components live in `src/components/edition/`. The production notes below document the earlier exploration of the likeness and source frames.

## Portrait Animation and Technical Direction

The first Claude-generated 3D head model was rejected by the user. Do not integrate that model. The user wants a holographic portrait that appears to turn through a sequence of images, similar to a cinematic image-frame animation. A freely orbitable 3D head is no longer a requirement.

Use a scroll-controlled sequence of consistent portrait frames. The code controls frame progression, transitions, scan effects, mesh overlays, and glow. Scrolling upward reverses the sequence. Keep the motion focused on a short, intentional turn or angle progression that supports the identity reveal. A full 360-degree view is not required.

The currently approved interaction is scroll-driven. Direct dragging to scrub through frames can be considered later, after the scroll version feels right. Do not make drag or touch gestures a blocker for the first version.

Current project facts checked on 2026-11-20:

- The application uses Next.js `16.2.12`, React `19.2.4`, Three.js `0.185.1`, and React Three Fiber `9.6.1`.
- Three.js and React Three Fiber are already used by the ambient scene. No framework migration is part of this brief; keep the current Next.js application.
- The current `Hero` uses `WorkspaceGuide` and `IdentitySprite` for a layered portrait experience.
- Existing portrait assets in `public/characters/identity-sprites-v3/` include real, half-scan, three-quarter, profile, and back views. Treat them as key visual references and possible starting frames. They are not a smooth turntable sequence, so review transitions before treating them as final animation frames.
- The existing `IdentitySprite` already layers portrait and hologram images with scan, noise, and frame effects. Inspect it before adding another rendering approach.
- The current direction does not require a `.glb` head model or Blender work. If the frame changes feel too abrupt, create consistent intermediate images or a rendered frame sequence. Keep face shape, lighting, framing, and hair consistent across frames. Fill unseen details with a restrained stylized interpretation.

The generated model can remain outside the portfolio. Keep it only if the user later requests another modeling attempt.

### First Step: Photo Reference Audit in Claude

**Status: completed.** Its purpose was to map the available portrait references, not to require a perfect scan. The audit prompt below is retained as a record of that completed step. Do not reuse its 360-degree modeling goal. The current portrait-animation direction above takes precedence.

- A view coverage table with each photo mapped to an approximate horizontal angle: front, three-quarter, left/right profile, rear three-quarter, and back.
- Coverage notes for vertical views such as crown and underside/chin, where available.
- The clearest photo for each view, plus issues caused by lighting, expression, lens distortion, hair, glasses, or occlusion.
- A prioritized list of additional photos needed to model the complete head.
- A consistent capture checklist for any new photos.

Use this prompt in Claude with the photos attached:

```text
Act as a 3D character artist reviewing reference photos for a future head model. I own the attached photos and want to use them as visual references for a full-head 3D portrait of myself. This is an art and modeling task, not identity verification.

Do not generate a 3D model yet. First audit the photos for viewpoint coverage and consistency. Do not invent features that are hidden. Clearly separate what is visible from what is uncertain.

For each photo, report its filename or attachment label, approximate yaw angle and view (front, three-quarter, left/right profile, rear three-quarter, or back), approximate pitch (level, above, or below), visibility of the face, ears, hair, crown, neck, and back of head, image quality, and any obstructions or distortions. Use approximate angles only. Treat straight-on as 0 degrees, profiles as about +/-90 degrees, and the back as about 180 degrees.

Then provide:
1. A coverage table showing which directions are well covered, weakly covered, or missing.
2. The best reference photo for each direction, with a short reason.
3. Visible identity details that should be preserved in the model, and details that cannot be determined from these photos.
4. A prioritized shot list of additional photos needed for a complete 360-degree head, including side, rear, crown, and underside views where needed.
5. A capture checklist for consistent lighting, neutral expression, camera distance, hair visibility, and avoiding filters or wide-angle distortion.
6. A short readiness assessment for creating a likeness-preserving 3D model, with the main remaining gaps.

Do not estimate biometric identity, age, health, personality, or other traits. Do not retouch or alter the photos. Do not claim the set is sufficient for 3D reconstruction unless all critical views are actually present.
```

### Photo Audit Status

Claude reviewed nine user-supplied photos on 2026-11-20. This summary records Claude's coverage findings and has not been independently re-evaluated against the original image files.

- **Available:** one weak frontal reference (P1), useful left and right profiles (best references P7 and P2), and one weak rear view (P4).
- **Detail references only:** near-profile selfies P5 and P9 have perspective distortion, so do not use them to set head proportions.
- **Optional views that could improve likeness:** left and right front three-quarter views near +/-45 degrees, a front view with the hairline visible, left and right rear three-quarter views near +/-135 degrees, a level back view, and a crown/top-down view.
- **Capture guidance:** use original files, consistent neutral expression and head level, even light, eye-height camera, distance that avoids selfie distortion, and keep the face/hair visible. Re-audit the expanded set before model creation.

The user accepts a stylized likeness rather than exact photogrammetric accuracy. The nine-photo set and current portrait renders are sufficient to guide a cinematic frame sequence. Additional photos are optional refinements if the selected views need better likeness or continuity.

### Frame Sequence Production

Start by testing the existing front, three-quarter, profile, and back images as key frames. Use scroll progress to drive frame changes and the scan overlay. If transitions feel abrupt, create intermediate frames with the same identity, framing, hair, and lighting. Review the motion at normal scroll speed before adding more frames. A single pre-rendered video converted to frames is also possible if it gives more consistent motion, but scroll must select decoded frames rather than seeking video time on every scroll event.

Keep the black, white, and lime holographic treatment in code where possible. This allows the portrait sequence to remain usable as image content while scan lines, mesh detail, noise, and glow respond to scroll.

Use the existing Next.js stack and current image/motion components for the first implementation. Load the image sequence progressively, keep a poster visible while frames load, support reduced motion with a stable key frame, keep sound off unless explicitly enabled, and test scroll behavior on a real phone. Three.js remains available for ambient effects if the final look needs it, but the portrait sequence does not depend on a 3D mesh.

## Closing Scene

The page ends with a memorable contact invitation:

- Natan appears as a full-body hologram, centered and waving.
- Surround him with a restrained field of futuristic robots and binary fragments (`0` and `1`). Keep the face/character readable and the CTA easy to find.
- **"WAITING FOR YOU"** is the current phrase direction, not final approved copy. Pair it with a clear English contact action.
- Existing waving images can inform the character design. A true orbitable full-body model is not a requirement for the footer unless the user later asks for it.

## Acceptance Criteria for This Direction

- The opening clearly identifies the experience with the `odevntzn` wordmark and an original faceted symbol.
- The scan reads as a fictional visual identity sequence; it does not imply collection or storage of biometric data.
- Scroll advances and reverses the intro predictably; the page remains normally scrollable after the handoff.
- Scrolling advances the portrait sequence and scanning effect, and scrolling upward reverses them.
- The portrait maintains a recognizable likeness, consistent framing, and clean transitions across its selected views.
- The symbol and wordmark remain legible without effects.
- The first-release interface is English throughout.
- The portrait sequence has a loading poster and a reduced-motion fallback.
- The footer ends with the waving hologram and a visible contact action.
- The layout and interaction remain usable on narrow screens and with keyboard/reduced-motion settings.

## Handoff Checklist for Astra

1. Read this brief and the current engineering/design docs. Resolve any remaining conflict using the precedence above.
2. Inspect `src/components/Hero.tsx`, `src/components/workspace/IdentitySprite.tsx`, `src/components/workspace/Scene3D.tsx`, `src/components/workspace/AmbientWorld.tsx`, `src/app/globals.css`, and `src/i18n/LanguageProvider.tsx`.
3. Read the relevant Next.js 16 documentation in `node_modules/next/dist/docs/` before changing application code.
4. Treat the supplied SVG as the approved logo. Check its static and animated use in the intro and prepare a symbol-only variant if needed.
5. Prototype the current portrait images as a scroll-controlled frame sequence. Add consistent intermediate frames only if the motion needs them.
6. Implement the English-first flow, reversible scroll timeline, loading and reduced-motion fallbacks, and closing scene in separate reviewable steps.

## Reference Notes

The supplied 3D guide distinguishes a scroll-scrubbed rendered sequence, a live 3D model, and geometry generated in code. The user's latest direction selects the frame-sequence approach for the holographic portrait. The guide's advice to write the beats first and keep page copy as HTML applies directly. Its example Vite stack is not a reason to migrate this Next.js project.
