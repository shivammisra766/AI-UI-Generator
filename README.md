# AI UI Generator -- Deterministic Agent System

This project is an AI-powered UI generator that converts natural
language descriptions into a working React UI using a fixed,
deterministic component library.

The goal was not just to generate UI, but to design a safe,
reproducible, and controlled AI system where LLM reasoning is validated
before execution.

------------------------------------------------------------------------

## 🔥 Live

-   Deployed App: **I have taken down the deployed app** 

------------------------------------------------------------------------

# 🧠 Architecture Overview

The system follows a multi-step agent architecture instead of relying on
a single LLM call.

User Prompt\
↓\
Planner Agent (LLM → Structured JSON Plan)\
↓\
Validation Layer (Schema + Whitelist Enforcement)\
↓\
Explainer Agent (LLM → Plain English Explanation)\
↓\
Deterministic React Renderer

The AI never generates JSX directly.\
All UI is derived deterministically from validated JSON.

------------------------------------------------------------------------

# 🏗 Agent Design

## 1️⃣ Planner Agent

The planner converts user intent into strict JSON.

Constraints enforced:

-   Only allowed components
-   Preserve existing IDs during modification
-   No JSX generation
-   No CSS generation
-   Modify existing plan instead of rewriting everything

------------------------------------------------------------------------

## 2️⃣ Validation Layer

The system does NOT trust LLM output blindly.

Before rendering:

-   Component whitelist enforcement
-   Layout enum validation
-   Recursive schema validation
-   Props object enforcement
-   Prompt injection guard

Invalid plans are rejected before execution.

------------------------------------------------------------------------

## 3️⃣ Explainer Agent

A separate LLM call explains:

-   Why certain components were chosen
-   What changed during modification
-   Layout decisions

This improves transparency and trust.

------------------------------------------------------------------------

# 🧱 Deterministic Component System

Fixed component library:

-   Button\
-   Card\
-   Input\
-   Table\
-   Modal\
-   Chart

Rules:

-   Components cannot be dynamically created
-   Styling is static
-   No AI-generated CSS
-   No external UI libraries
-   JSX view is a deterministic projection of JSON

The JSON plan is the single source of truth.

------------------------------------------------------------------------

# 🔁 Iteration & Versioning

The system supports incremental modification:

-   existingPlan passed to planner
-   ID preservation enforced
-   Diff view between versions
-   Structural drift detection
-   Version history navigation
-   Rollback support
-   Manual JSON edit (validated before applying)

------------------------------------------------------------------------

# 🛡 Safety Features

-   Component whitelist
-   Schema validation
-   Layout enum restriction
-   Prompt injection filtering
-   Drift detection warnings
-   Manual edit validation

------------------------------------------------------------------------

# ✨ Optional Enhancements Implemented

-   Streaming explanation responses\
-   JSON ↔ JSX toggle view\
-   Diff visualization\
-   Structural drift detection\
-   Clickable version history\
-   Toast-based error handling

------------------------------------------------------------------------

# ⚖ Engineering Tradeoffs

**Why JSON instead of JSX generation?**\
JSON allows validation before execution and enforces determinism.

**Why restrict layout to enum?**\
To maintain structural consistency.

**Why separate planner and explainer?**\
To separate structured reasoning from human-readable reasoning.

**Why enforce whitelist?**\
To preserve visual consistency and deterministic behavior.

------------------------------------------------------------------------

# ⚠ Known Limitations

-   Diff is line-based (not AST-based)
-   Prompt guard is lightweight
-   No persistent storage
-   No authentication
-   No multi-user support

------------------------------------------------------------------------

# 🚀 Future Improvements

-   AST-level diff
-   Persistent session storage
-   Stronger prompt security
-   Per-component prop validation
-   Collaborative support

------------------------------------------------------------------------

# 🧪 Local Setup

## Backend

``` bash
cd backend
npm install
npm run dev
```

## Frontend

``` bash
cd frontend
npm install
npm run dev
```

Environment variable required:

    GROQ_API_KEY=your_key

------------------------------------------------------------------------

# 🎯 What This Project Demonstrates

-   AI agent orchestration\
-   Deterministic UI generation\
-   Safe LLM integration\
-   Controlled iterative reasoning\
-   System-level AI design thinking

------------------------------------------------------------------------

Submission:\
AI UI Generator Assignment -- Shivam Misra
