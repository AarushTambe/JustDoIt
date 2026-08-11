# PROJECT BUILD DIRECTIVE
# Minimal Collaborative TODO — Production-Safe Two-Person Task System

ROLE

You are the autonomous lead software engineer, solution architect, security engineer, QA engineer, and DevOps engineer responsible for taking this project from an empty repository to a working, deployable application.

You are operating inside Google Antigravity IDE and will be executed through the `/goal` workflow.

Your objective is to BUILD the application, not merely describe how it could be built.

You have high implementation autonomy, but that autonomy exists only within the requirements and constraints defined below.

You are responsible for:
- understanding the requirements
- inspecting the environment
- selecting appropriate technologies
- designing the architecture
- implementing the application
- testing it
- fixing defects
- validating security
- validating concurrent operation
- preparing deployment
- documenting the final system

Do not stop at scaffolding.

The final result must be a genuinely working application.

---

# 1. PROJECT OBJECTIVE

Build a small, private, collaborative TODO/task management application for two initial users.

The application should provide a clean, distraction-free workspace separated from the clutter of the users' normal personal digital environments.

The application must be:

- accessible from mobile
- accessible from laptop/desktop
- installable/usable as a PWA
- usable concurrently by both users
- persistent
- secure
- responsive
- visually clean
- simple to operate
- reliable
- free to operate
- maintainable
- easy to extend if additional users are added later

The application is intentionally small.

DO NOT turn it into a general-purpose project-management SaaS.

Do not add unnecessary features merely because they are common in task-management products.

Simplicity is a requirement.

---

# 2. CURRENT USERS AND ACCESS MODEL

There are currently two intended users.

The architecture SHOULD NOT hard-code the application around exactly two users.

It should be capable of supporting additional users later without requiring a fundamental rewrite.

However, the initial product should remain optimized for a very small user base.

INITIAL ACCESS MODEL:

Use one shared login for both initial users.

The users should not need separate accounts at this stage.

Do not build a complex role/permission system unless technically required for security or future extensibility.

CURRENT VISIBILITY MODEL:

All authenticated users can see all tasks.

There is no private-task functionality.

There is no requirement for per-user data isolation.

---

# 3. TASK MODEL

A task must support:

- Title
- Description
- Due date
- Assigned user
- Tags
- Group
- Status
- Star/favorite state
- Created timestamp
- Updated timestamp

STATUS:

At minimum:

TODO
IN PROGRESS
DONE

Do not add additional statuses unless technically necessary.

PRIORITY:

There is NO formal priority system.

Instead, provide a simple star/favorite mechanism.

A starred task should be visually distinguishable.

Do not introduce:
- Low
- Medium
- High
- Critical
- Priority scores

unless explicitly requested later.

---

# 4. GROUPS

Tasks must belong to a group.

The primary known organization is:

Aethron

with multiple subgroups.

The architecture should support:

- groups
- subgroups
- future expansion

Do not hard-code only one Aethron hierarchy into the application logic.

The group structure should be data-driven.

The exact initial subgroup names should be determined from user-provided data if supplied later.

---

# 5. TASK LIFECYCLE

Normal lifecycle:

TODO
↓
IN PROGRESS
↓
DONE

Completed tasks may eventually be deleted.

Deletion must NOT immediately destroy the record permanently.

IMPLEMENT RECOVERABLE DELETION.

Preferred behavior:

- Deleted tasks enter a recoverable deleted/trash state.
- They are hidden from normal task views.
- They can be restored.
- Permanent deletion may occur later through a deliberate action or cleanup policy.

Do not build complicated archival functionality.

---

# 6. RECURRING TASKS

NOT REQUIRED.

Do not implement:
- recurring tasks
- schedules
- daily tasks
- weekly tasks
- monthly tasks

unless explicitly requested in a later instruction.

---

# 7. SEARCH

Implement basic search.

Search should support useful keyword-based discovery across:

- task title
- task description
- tags
- groups/subgroups

Do not build a complex search engine.

For fewer than approximately 100 tasks, prioritize simplicity and reliability over sophisticated search infrastructure.

---

# 8. NOTIFICATIONS

The application should provide task-related notifications only if they can be implemented without:

- paid services
- external API keys
- unnecessary infrastructure
- compromising security
- significantly increasing architectural complexity

The preferred mechanism is a browser/PWA notification mechanism if realistically supported.

Before implementing notifications:

VERIFY:
- browser support
- PWA limitations
- whether the chosen deployment architecture supports them
- whether additional permissions or infrastructure are required

If reliable notification delivery cannot be achieved without introducing paid infrastructure, external API credentials, or substantial complexity:

DO NOT fake or partially implement notifications.

Instead:
- document the limitation
- implement the simplest reliable alternative only if appropriate

Do not introduce third-party notification APIs merely to claim notification support.

---

# 9. CONCURRENT OPERATION

Both users must be able to use the application at the same time.

If User A:
- creates a task
- edits a task
- changes its status
- assigns it
- stars it
- deletes it
- restores it

User B should receive the updated state without requiring a manual page refresh where practical.

REAL-TIME synchronization is desirable.

However:

REAL-TIME synchronization is NOT worth introducing instability.

If WebSockets or another real-time mechanism can be implemented reliably within the selected architecture, use it.

Otherwise, use a simpler robust synchronization strategy.

Do not implement real-time functionality merely because it sounds impressive.

---

# 10. CONCURRENT EDIT CONFLICT POLICY

If both users modify the same task at approximately the same time:

USE:

LAST WRITE WINS.

Do not implement:
- collaborative text editing
- CRDTs
- operational transformation
- complex conflict-resolution engines

The system should ensure that concurrent requests do not corrupt the database or leave tasks in invalid states.

---

# 11. OFFLINE REQUIREMENT

Offline operation is NOT required.

Assume the users have an Internet connection.

Do not introduce offline-first architecture unless required for PWA functionality.

The PWA may cache static application resources appropriately, but task synchronization should rely on the online backend.

---

# 12. UI/UX OBJECTIVE

The interface is one of the most important parts of the product.

The application exists specifically to provide a clean workspace away from the clutter of normal personal digital life.

The UI should feel:

- minimal
- calm
- focused
- premium
- intuitive
- fast
- uncluttered

VISUAL REFERENCE:

Apple-like design philosophy.

This does NOT mean copying Apple's interface.

Instead use principles such as:

- restrained visual hierarchy
- generous whitespace
- clean typography
- subtle borders
- simple controls
- minimal visual noise
- restrained animations
- clear information hierarchy
- consistent spacing

DARK MODE:

Optional.

Implement it only if it can be done cleanly without compromising simplicity.

ANIMATION:

Basic subtle transitions and micro-interactions are acceptable.

Do not introduce excessive animation.

---

# 13. HOME SCREEN

The home screen must communicate important information immediately without becoming a dashboard full of widgets.

It should prioritize:

- current tasks
- task status
- due dates
- assignment
- starred tasks
- group/context

Avoid:

- unnecessary charts
- analytics dashboards
- decorative statistics
- excessive cards
- gamification
- motivational content
- unnecessary widgets

The agent should determine the cleanest information hierarchy after inspecting the full requirements.

---

# 14. MOBILE + DESKTOP

The application must be responsive.

PRIMARY DELIVERY MODEL:

Progressive Web App (PWA).

It should work well on:

- Android/iOS mobile browsers where supported
- laptop browsers
- desktop browsers

The UI must not simply be a desktop interface compressed onto a phone.

Mobile interaction must be deliberately designed.

Ensure:

- touch-friendly controls
- readable typography
- appropriate spacing
- no horizontal overflow
- usable forms
- usable task editing
- usable navigation

---

# 15. AUTHENTICATION AND SECURITY

Security requirement:

BASIC BUT STRONG.

The application will be publicly reachable over the Internet.

Only authenticated users should be able to access the application and its data.

Required principles:

- HTTPS in production
- secure password handling if passwords are used
- secure session/token handling
- server-side authorization
- protected API endpoints
- no sensitive credentials in source code
- no secrets committed to Git
- secure environment-variable handling
- appropriate CORS configuration
- input validation
- protection against common injection attacks
- appropriate rate limiting where justified
- secure database credentials
- secure production configuration

Do not expose:
- database credentials
- server secrets
- authentication secrets
- internal filesystem paths
- debugging information

Do not rely solely on frontend route protection.

ALL security-sensitive authorization must be enforced server-side.

Do not implement an unnecessarily complex security architecture for a two-user application.

---

# 16. HOSTING AND COST CONSTRAINT

ABSOLUTE REQUIREMENT:

The application must be deployable and operable at ₹0 ongoing cost if realistically possible.

Do not assume a paid cloud service.

Do not ask the user to add a credit card merely to satisfy the architecture.

Before selecting infrastructure:

RESEARCH AND VERIFY CURRENT FREE OPTIONS.

Evaluate appropriate current free-tier options for:

- frontend hosting
- backend hosting
- database
- authentication if external auth is used
- PWA hosting
- CI/CD

Consider options such as free-tier managed platforms, but DO NOT assume that any specific provider is still free or suitable.

Free-tier limits change.

Therefore:

VERIFY CURRENT AVAILABILITY AND LIMITATIONS BEFORE LOCKING THE ARCHITECTURE.

Select the simplest architecture that satisfies:

1. reliability
2. security
3. persistence
4. concurrent access
5. PWA requirements
6. zero-cost operation

Do not optimize for theoretical scalability at the expense of free operation and simplicity.

If a genuinely reliable zero-cost architecture cannot satisfy a requirement, state the limitation explicitly rather than pretending otherwise.

---

# 17. TECHNOLOGY SELECTION

No technology stack has been predetermined.

You must select the stack.

Selection criteria, in priority order:

1. Stability
2. Security
3. Zero-cost deployment
4. Simplicity
5. Maintainability
6. Development speed
7. Mobile/PWA compatibility
8. Future extensibility

Do not select technologies merely because they are fashionable.

Do not introduce:

- microservices
- Kubernetes
- message brokers
- distributed systems
- unnecessary caches
- complex state-management systems
- unnecessary databases

unless a concrete requirement justifies them.

For this project, a well-designed monolithic or small full-stack architecture is strongly preferred.

Before implementation, explain the chosen architecture and why it is appropriate.

---

# 18. DATABASE

Use a persistent database appropriate for concurrent multi-user operation.

The database must safely handle:

- concurrent reads
- concurrent writes
- task updates
- deletion/recovery
- group relationships
- user assignment

Do not use a fragile local-only storage mechanism for production deployment merely because it is easy.

The final database choice must be compatible with the selected free deployment architecture.

---

# 19. DATA MODEL

At minimum, design appropriate entities for:

- User/access identity
- Task
- Group
- Tag
- Deleted/recoverable task state

You may normalize or simplify this model where appropriate.

Do not over-engineer the schema.

Ensure:

- proper primary keys
- appropriate indexes
- timestamps
- referential integrity
- safe deletion semantics

---

# 20. ARCHITECTURE

Before implementation, determine and document:

- frontend
- backend/API
- database
- authentication/session layer
- real-time synchronization layer if used
- PWA layer
- hosting
- CI/CD
- environment configuration

Create a clear data-flow model:

USER
→ FRONTEND/PWA
→ AUTHENTICATION
→ API/BACKEND
→ DATABASE
→ SYNCHRONIZATION
→ OTHER CLIENT

Do not begin implementation until the architecture is internally consistent.

---

# 21. API DESIGN

If a backend API is used, define clean endpoints for operations such as:

- authentication
- retrieving tasks
- creating tasks
- updating tasks
- changing task status
- assigning tasks
- starring/un-starring tasks
- deleting tasks
- restoring tasks
- retrieving groups
- searching/filtering

Do not create unnecessary endpoints.

All endpoints must:

- validate inputs
- authenticate requests where required
- authorize access
- return predictable errors
- avoid leaking sensitive information

---

# 22. REAL-TIME SYNCHRONIZATION

If real-time synchronization is implemented:

The synchronization layer must handle:

- connection loss
- reconnection
- duplicate events
- stale state
- concurrent modifications
- authentication
- server restarts

Do not assume a WebSocket connection is permanent.

If the connection drops:

The application must recover gracefully.

The database remains the source of truth.

The frontend must never treat a temporary real-time event as permanent authority over persisted state.

---

# 23. ERROR HANDLING

The application must fail gracefully.

Handle:

- network failure
- expired authentication
- invalid input
- database errors
- concurrent updates
- missing task
- deleted task
- restore failure
- synchronization failure
- deployment/configuration errors

Never show raw stack traces to users in production.

Provide useful user-facing errors.

Log appropriate diagnostic information server-side without exposing secrets.

---

# 24. TESTING

Testing is mandatory.

Create tests relevant to the actual architecture.

At minimum consider:

### Unit Tests
- task logic
- validation
- search/filtering
- deletion/recovery
- status transitions

### API/Integration Tests
- authentication
- authorization
- CRUD operations
- concurrent requests
- invalid requests
- database interactions

### Security Tests
- unauthorized API access
- invalid authentication
- session handling
- injection attempts
- malformed input
- unauthorized task manipulation

### Concurrency Tests
Test scenarios where two clients simultaneously:

- create tasks
- edit tasks
- update status
- star tasks
- delete/restore tasks

Verify that LAST WRITE WINS behaves deterministically and database state remains valid.

### E2E Tests
Test important real user flows:

1. Login
2. View tasks
3. Create task
4. Assign task
5. Edit task
6. Change status
7. Star task
8. Search
9. Delete
10. Recover
11. Verify second client receives updates

### Responsive Tests

Verify usable behavior on:

- mobile viewport
- tablet-sized viewport
- laptop/desktop viewport

Do not blindly create hundreds of tests.

Prioritize tests around actual failure risks.

---

# 25. CI/CD

Use GitHub as the source of truth.

Implement GitHub Actions only where useful.

At minimum, CI should automatically perform relevant:

- dependency installation
- linting
- type checking if applicable
- automated tests
- build verification
- security/dependency checks

Do not create elaborate enterprise CI/CD for a two-user application.

The pipeline should be simple, reliable, and maintainable.

Never commit:

- secrets
- production credentials
- `.env` files containing secrets
- private tokens

Provide an appropriate `.env.example`.

---

# 26. GIT WORKFLOW

Use a sensible Git workflow.

Recommended:

main
└── feature branches

Do not create unnecessary branch complexity.

Every significant feature should be independently reviewable where practical.

Maintain a clean commit history.

---

# 27. OBSERVABILITY

The application is small, so observability should remain proportionate.

Implement useful:

- server logs
- error logs
- authentication failure logging where appropriate
- application health check
- deployment diagnostics

Do not introduce expensive monitoring infrastructure.

A simple `/health` endpoint may be sufficient if appropriate.

---

# 28. PERFORMANCE

Expected scale:

Fewer than 100 tasks initially.

Do not prematurely optimize.

However:

- pages should load quickly
- API responses should be efficient
- database queries should be indexed appropriately
- the frontend should avoid unnecessary rerendering
- real-time updates should not cause excessive requests
- application should remain responsive on mobile

Do not introduce Redis, queues, caching infrastructure, or similar components unless profiling or architecture genuinely requires them.

---

# 29. EXTENSIBILITY

The application may eventually have more users.

Therefore:

Do:
- use proper user identity abstraction
- avoid hard-coding two user IDs throughout the system
- keep task assignment data-driven
- keep groups data-driven
- keep authentication separable from business logic

Do NOT:
- build a full multi-tenant SaaS platform
- build enterprise RBAC
- build organization billing
- build subscription management

Future extensibility must not become present-day complexity.

---

# 30. EXPLICIT NON-GOALS

Do NOT implement unless explicitly requested:

- recurring tasks
- calendar integration
- email integration
- WhatsApp integration
- file attachments
- comments
- chat
- team presence
- collaborative text editing
- analytics dashboards
- time tracking
- invoicing
- billing
- subscriptions
- gamification
- AI task generation
- AI assistants
- complex role systems
- enterprise administration
- offline-first synchronization
- native mobile applications

The product should remain a focused TODO workspace.

---

# 31. AGENT AUTONOMY

You have HIGH implementation autonomy.

You may:

- choose technologies
- choose architecture details
- create files
- install appropriate dependencies
- write code
- run tests
- run builds
- fix defects
- improve implementation
- configure CI/CD
- configure deployment

provided that your decisions remain within the requirements above.

You MUST NOT silently change:

- product scope
- authentication model
- task semantics
- concurrency policy
- cost requirement
- security requirements
- platform requirements

If an implementation decision affects one of these, stop and ask.

---

# 32. EVIDENCE AND HONESTY

Never claim that something works merely because code exists.

For every major milestone:

VERIFY IT.

Use actual:

- tests
- builds
- local execution
- API calls
- browser testing
- deployment verification

Distinguish:

VERIFIED
- directly tested or observed

INFERRED
- logically expected but not directly verified

UNKNOWN
- cannot currently be established

Never convert UNKNOWN into VERIFIED language.

---

# 33. NO FAKE IMPLEMENTATION

This is a critical rule.

Never create:

- placeholder APIs presented as complete
- fake synchronization
- mock authentication presented as production authentication
- fake notification systems
- hard-coded task data presented as database functionality
- UI buttons that do nothing
- TODO comments where actual implementation is required

If a feature cannot currently be implemented correctly:

State why.

Do not fake it.

---

# 34. DEVELOPMENT METHOD

Build incrementally.

Do NOT generate the entire application blindly in one pass.

Recommended sequence:

PHASE 0
Repository and environment inspection.

PHASE 1
Architecture and technology decision.

PHASE 2
Project foundation.

PHASE 3
Database and persistence.

PHASE 4
Authentication.

PHASE 5
Core task CRUD.

PHASE 6
Groups, tags, assignment, status, starring.

PHASE 7
Search/filtering.

PHASE 8
Recoverable deletion.

PHASE 9
Concurrent synchronization.

PHASE 10
Responsive PWA UX.

PHASE 11
Notifications if technically justified.

PHASE 12
Security hardening.

PHASE 13
Automated testing.

PHASE 14
GitHub CI/CD.

PHASE 15
Production deployment.

PHASE 16
Final verification and documentation.

You may reorganize these phases if architectural dependencies make another sequence superior.

If you change the sequence, explain why.

---

# 35. PHASE GATES

Do not blindly proceed from one phase to the next.

Each phase must have:

- objective
- implementation tasks
- dependencies
- verification
- acceptance criteria

A phase is complete only when its acceptance criteria are satisfied.

If a phase fails verification:

1. identify the failure
2. diagnose the cause
3. fix it
4. rerun verification
5. only then continue

Do not stack new features on top of known broken foundations.

---

# 36. INITIAL EXECUTION

When this goal begins:

DO NOT immediately start writing application code.

First:

1. Inspect the local environment.
2. Inspect the repository.
3. Confirm it is a new project.
4. Determine available runtimes/tools.
5. Evaluate current free hosting/database options if external research is available.
6. Compare viable architecture choices.
7. Select the simplest architecture satisfying the requirements.
8. Present the final technical architecture.
9. Establish the implementation roadmap.
10. Then begin implementation.

Do not ask questions that have already been answered in this specification.

Do not ask the user to choose between technologies when you can make a technically justified decision yourself.

Only ask when the decision materially changes the product or violates an explicit requirement.

---

# 37. ARCHITECTURAL DECISION RECORD

Before implementation, create a concise architecture decision record covering:

- selected frontend technology
- selected backend technology
- selected database
- authentication mechanism
- real-time synchronization mechanism
- PWA strategy
- hosting provider
- CI/CD approach
- notification approach
- major security controls

For each decision include:

DECISION
REASON
ALTERNATIVES CONSIDERED
TRADEOFFS

Do not write essays.

---

# 38. FINAL ACCEPTANCE CRITERIA

The application is considered complete only when:

FUNCTIONAL
- users can authenticate
- users can create tasks
- users can edit tasks
- users can assign tasks
- users can assign groups
- users can add tags
- users can change status
- users can star tasks
- users can search tasks
- users can delete tasks
- users can recover deleted tasks

COLLABORATION
- both users can use the system concurrently
- changes synchronize reliably if real-time synchronization is implemented
- concurrent edits follow LAST WRITE WINS
- database state remains consistent

UX
- works on mobile
- works on laptop
- PWA is functional
- interface is clean and uncluttered
- basic animations are smooth
- no unnecessary UI complexity

SECURITY
- unauthenticated users cannot access protected data
- API authorization is enforced server-side
- secrets are protected
- production traffic uses HTTPS
- common input/security vulnerabilities have been addressed

RELIABILITY
- no known critical defects
- automated tests pass
- build succeeds
- deployment succeeds
- important failure paths have been tested

COST
- deployed architecture operates within the selected genuinely free tier
- no hidden paid API dependency
- no unnecessary external service requiring payment

---

# 39. FINAL DOCUMENTATION

When implementation is complete, provide:

1. Architecture overview
2. Technology stack
3. Repository structure
4. Database schema
5. Authentication model
6. Synchronization model
7. API documentation
8. PWA behavior
9. Security model
10. Testing strategy and results
11. Deployment instructions
12. Environment variables
13. GitHub CI/CD explanation
14. Known limitations
15. Future extension points

Do not claim capabilities that were not verified.

---

# FINAL DIRECTIVE

Build the smallest technically sound system that completely satisfies the requirements.

Do not build a generic TODO SaaS.

Do not optimize for feature count.

Do not optimize for architectural complexity.

Optimize for:

SECURITY
+
RELIABILITY
+
SIMPLICITY
+
CLEAN UX
+
CONCURRENT USE
+
ZERO-COST OPERATION
+
FUTURE EXTENSIBILITY

When forced to choose between a sophisticated architecture and a simpler architecture that reliably satisfies the requirements, prefer the simpler architecture.

When forced to choose between claiming a feature works and honestly reporting that it is not yet verified, choose honesty.

The end result must be a real, working, tested, deployable application — not a prototype disguised as a finished product.