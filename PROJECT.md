# Project: Foolish Arc Storefront (Project Zaytoun)

## Architecture
- **Frontend**: React 19.1.1, React Router 7.9.6, Tailwind CSS 3.4.17, Vite 7.1.7 single-page luxury 3D e-commerce application (`src/`, `public/`).
- **Backend**: Express 5.3.0, Mongoose 9.11.2, JWT authentication, sliding-window rate limiting, Joi validation schemas, Google OAuth authentication (`server/`, `api/`).
- **Testing Engine**: Built-in Node test runner (`node --test`), covering Tier-1 interactive 3D/canvas features and API security defenses (`tests/e2e/tier1_features/`, `tests/security/`, `tests/integration/`).
- **Target Working Directory**: `/Users/macbookpro/Music/projects/project zaytoun ` (note trailing space).

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | Configuration Snapshot Backup | Backup `.env`, `package.json`, `package-lock.json` into `.agents/teamwork/backups/` before replacement | M1 | Survey | DONE |
| 2 | Isolated Staging Extraction | Extract `/Users/macbookpro/Downloads/FOOLISH_ARC_Fixed (1).zip` into `/tmp/foolisharc_fixed_staging` and unnest `foolisharc_repaired/` | M1 | Survey | DONE |
| 3 | Selective Synchronization | Synchronize extracted source code into `/Users/macbookpro/Music/projects/project zaytoun ` with strict exclusion of `.env`, `.git/`, `.agents/`, `*.zip`, and template packs | M1 | Survey | DONE |
| 4 | Obsolete Asset Removal | Remove `public/models/model_backup.glb` (6MB obsolete binary) per fixed archive specification | M1 | Survey | DONE |
| 5 | Environment & Secrets Preservation | Verify `.env` retains all active production/dev keys, not overwritten by `.env.example` | M1 | Survey | DONE |
| 6 | Git & Agents Metadata Preservation | Verify `.git/` history and `.agents/` skills/teamwork directories are untouched | M1 | Survey | DONE |
| 7 | Archive File Preservation | Verify `project-zaytoun.zip`, `foolisharc-source-code.zip`, `funny-arc-ai-studio.zip`, `3d_and_admin_templates_pack.zip` are untouched | M1 | Survey | DONE |
| 8 | Dependency Integrity Check | Run `npm install` to ensure lockfile compliance and engine constraint validation | M2 | Survey | DONE |
| 9 | E2E & Security Test Execution | Run `npm test` verifying 98 tests across 16 feature suites pass with 0 errors | M2 | Survey | DONE |
| 10 | Production Vite Compilation | Run `npm run build` verifying clean production bundle generation in `dist/` | M2 | Survey | DONE |
| 11 | Composite Health Check | Run `npm run check` verifying test and build pass sequentially | M2 | Survey | DONE |
| 12 | Independent Multi-Agent Verification | Reviewer, Challenger, and Forensic Auditor verification | M3 | Survey | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| M1 | Safe Codebase Replacement & Config Preservation | Backup configs, extract zip to staging, rsync source into project with exclusions, delete obsolete models, verify preservation whitelist | none | DONE | 174/174 files synchronized with 100% SHA-256 parity; `.env` SHA-256 `4a9baca34f2e411b283bfc91a4e982ad4f978679c0d00e362f48e195a9c3f532` preserved byte-for-byte; `.git`, `.agents`, 4 backup zips intact |
| M2 | Build and Test Verification | Run `npm install`, execute `npm test` (98 tests), execute `npm run build`, execute `npm run check`, resolve any failures | M1 | DONE | `npm test` 98/98 tests pass (0 failures); `npm run build` Vite compiled in 4.58s; `npm run check` passed sequentially; `npm audit` 0 vulnerabilities |
| M3 | Multi-Agent Review & Forensic Integrity Audit | 2 Reviewers, 2 Challengers, and Forensic Auditor verifying zero cheating, config integrity, and clean builds/tests | M2 | DONE | reviewer_1 (APPROVE), reviewer_2 (APPROVE), challenger_1 (APPROVE), challenger_2 (APPROVE), auditor_1 (CLEAN). Gate Result: PASS |

## Interface Contracts
### Replacement Sync Contract
- **Source**: `/Users/macbookpro/Downloads/FOOLISH_ARC_Fixed (1).zip` -> staging `/tmp/foolisharc_fixed_staging/foolisharc_repaired/`
- **Destination**: `/Users/macbookpro/Music/projects/project zaytoun `
- **Exclusion Whitelist**:
  `--exclude='.git'`
  `--exclude='.env'`
  `--exclude='.agents'`
  `--exclude='*.zip'`
  `--exclude='3d_and_admin_templates_pack'`
  `--exclude='Little-Motion-50-Source-Code'`
  `--exclude='node_modules'`
  `--exclude='dist'`

### Verification Contracts
- **Test Command**: `cd "/Users/macbookpro/Music/projects/project zaytoun " && npm test`
  - Result: `pass 98, fail 0` (duration ~1.5s)
- **Build Command**: `cd "/Users/macbookpro/Music/projects/project zaytoun " && npm run build`
  - Result: `built in ~4.5s, exit code 0`
- **Preservation Check**:
  - `test -f "/Users/macbookpro/Music/projects/project zaytoun /.env"` -> verified byte-for-byte identical to snapshot
  - `test -d "/Users/macbookpro/Music/projects/project zaytoun /.git"` -> verified functional on branch main
  - `test -d "/Users/macbookpro/Music/projects/project zaytoun /.agents"` -> verified skills and teamwork intact

## Code Layout
```
/Users/macbookpro/Music/projects/project zaytoun /
├── .agents/                 # Teamwork logs, skills, backups [PRESERVED]
├── .env                     # Live environment secrets [PRESERVED]
├── .env.example             # Environment variable documentation template
├── .git/                    # Git repository version control [PRESERVED]
├── .gitignore               # Repository ignore rules
├── .vscode/                 # Workspace editor settings
├── api/                     # Vercel serverless functions
├── dist/                    # Production build output
├── forme-reference/         # FORME standalone reference
├── index.html               # Main HTML entrypoint
├── package.json             # Manifest and scripts
├── package-lock.json        # Locked dependency tree
├── postcss.config.js        # PostCSS configuration
├── public/                  # Static models (.glb), images, videos
├── scripts/                 # Utility scripts (hash-admin-password.js)
├── server/                  # Express backend, Mongoose models, routes
├── src/                     # React frontend source, components, pages
├── tailwind.config.js       # Tailwind CSS luxury theme config
├── tests/                   # E2E tier1, security, and integration test suites
├── vercel.json              # Deployment and CSP headers config
└── *.zip                    # Standalone project backup archives [PRESERVED]
```
