# Build Verification Guide

This document provides comprehensive details on how to verify that the project builds successfully after changes.

## Prerequisites

### Required Software Versions
- **Node.js**: >=20.15.1 (project requirement from package.json)
- **Yarn**: 4.7.0 (specified in package.json packageManager field)

Check your versions:
```bash
node --version  # Should be v20.15.1 or higher
yarn --version  # Should be 4.7.0
```

## Installation Steps

### 1. Install Dependencies
```bash
yarn install
```

**Expected outcome**: 
- Should complete without network errors
- May show peer dependency warnings (these are acceptable)
- Will run post-install patch-package script

**Common issues**:
- If you see JSR registry errors (`npm.jsr.io`), check that problematic JSR dependencies have been removed
- Peer dependency warnings are non-blocking and can be ignored

## Build Verification Steps

### 2. Clean Build Artifacts
```bash
yarn build:clean
```

**What it does**: Runs `tsc --build --clean` to remove previous TypeScript compilation artifacts

**Expected outcome**: Completes silently with exit code 0

### 3. Build Views (Vite)
```bash
yarn build:views
```

**What it does**: 
- Runs `yarn build:clean` first
- Then builds `@dendronhq/dendron-plugin-views` package using Vite

**Expected outcome**:
- Vite production build completes
- Creates bundle in `packages/dendron-plugin-views/build/`
- Bundle size approximately 4.4-4.5 MB (may vary)
- You may see warnings about:
  - Large chunk sizes (>500 KB) - this is expected
  - Module externalization for browser compatibility - this is normal
  - Use of eval in gray-matter - this is from a dependency

**Output artifacts**:
```
packages/dendron-plugin-views/build/
├── index.html
├── static/
│   ├── css/index.styles.css
│   └── js/index.bundle.js
├── favicon.ico
├── logo192.png
├── logo512.png
├── manifest.json
└── robots.txt
```

### 4. Build Extension (tsup)
```bash
yarn build:extension
```

**What it does**: 
- Runs `yarn workspace dendron run vscode:prepublish`
- Builds plugin-core package using tsup
- Entry point: `packages/plugin-core/src/extension.ts`

**Expected outcome**:
- tsup build completes
- Creates bundle in `packages/plugin-core/dist/`
- Extension bundle size approximately 14-15 MB
- Source map size approximately 22-23 MB
- May see warning: "You have emitDecoratorMetadata enabled but @swc/core was not installed" - this is expected

**Output artifacts**:
```
packages/plugin-core/dist/
├── extension.js         (~14-15 MB)
├── extension.js.map     (~22-23 MB)
├── assets/
├── favicon.ico
├── index.html
├── logo192.png
├── logo512.png
├── manifest.json
└── robots.txt
```

### 5. Full Build
```bash
yarn build
```

**What it does**: Runs the complete build pipeline:
1. `yarn build:clean`
2. `yarn build:views`
3. `yarn build:extension`

**Expected outcome**: All three steps complete successfully (see individual step expectations above)

**Total build time**: Approximately 1-2 minutes depending on system

### 6. TypeScript Type Checking
```bash
yarn typecheck
```

**What it does**: Runs `tsc --build packages/plugin-core`

**Expected outcome**: 
- Completes silently with exit code 0
- No TypeScript compilation errors

## Build Configuration Files

### Key Configuration Files
- `package.json` - Build scripts and workspace configuration
- `tsconfig.json` - Root TypeScript configuration with project references
- `tsconfig.build.json` - Build-specific TypeScript settings
- `lerna.json` - Monorepo management configuration
- `.yarnrc.yml` - Yarn configuration
- `packages/dendron-plugin-views/vite.config.ts` - Vite build configuration
- `packages/plugin-core/tsup.config.ts` - tsup build configuration

## Monorepo Structure

This is a TypeScript monorepo using:
- **Yarn Workspaces**: For dependency management across packages
- **Lerna**: For monorepo orchestration (version 3.19.0)
- **TypeScript Project References**: For incremental builds

### Workspace Packages (packages/*)
- api-server
- common-all
- common-assets
- common-frontend
- common-server
- common-test-utils
- dendron-cli
- dendron-plugin-views (Vite build)
- dendron-viz
- engine-server
- engine-test-utils
- generator-dendron
- plugin-core (tsup build)
- pods-core
- unified

## Troubleshooting

### Build Fails with Network Errors
**Problem**: Cannot access npm.jsr.io or other registries

**Solution**: 
- Check `.yarnrc.yml` for registry configuration
- Verify no JSR dependencies in package.json
- Run `yarn install --mode=update-lockfile` if lockfile needs updating

### Build Fails with "Module not found"
**Problem**: Missing dependencies

**Solution**:
- Delete `node_modules` directories: `find . -name "node_modules" -type d -prune -exec rm -rf {} +`
- Delete `.yarn/install-state.gz`
- Run `yarn install` again

### TypeScript Errors
**Problem**: Type checking fails

**Solution**:
- Run `yarn build:clean` to clear stale build artifacts
- Check that all workspace packages have their dependencies installed
- Verify TypeScript version matches package.json (^5.8.3)

### Large Bundle Size Warnings
**Problem**: Vite warns about large chunks (>500 KB)

**Solution**: This is expected for this project. The warnings can be ignored or suppressed by adjusting `build.chunkSizeWarningLimit` in vite.config.ts if needed.

## CI/CD Integration

### For CI Pipelines
```bash
# Full build verification sequence
yarn install --frozen-lockfile  # Ensure exact dependency versions
yarn build                      # Run full build
yarn typecheck                  # Verify types
```

### Exit Codes
- `0` = Success
- `1` = Build failed (check error output)

## Changes Made in This PR

### Removed Dependencies
- `@pawk3k/ts-migrator` - Removed from package.json
  - **Reason**: JSR registry inaccessible in CI environments
  - **Verification**: Grep confirmed not used in codebase
  - **Impact**: Allows `yarn install` to complete without network errors

### Modified Files
- `package.json` - Removed unused dependency
- `yarn.lock` - Updated to reflect dependency removal
- `.yarn/install-state.gz` - Updated install state

## Verification Checklist

Use this checklist to verify builds:

- [ ] Node.js version >= 20.15.1
- [ ] Yarn version = 4.7.0
- [ ] `yarn install` completes without errors
- [ ] `yarn build:clean` completes successfully
- [ ] `yarn build:views` produces artifacts in `packages/dendron-plugin-views/build/`
- [ ] `yarn build:extension` produces artifacts in `packages/plugin-core/dist/`
- [ ] `yarn build` completes full pipeline
- [ ] `yarn typecheck` passes without errors
- [ ] No blocking errors in build output (warnings are acceptable)

## Performance Benchmarks

### Typical Build Times (reference)
- `yarn install`: 15-30 seconds (first time), 5-10 seconds (cached)
- `yarn build:views`: 30-35 seconds
- `yarn build:extension`: 15-20 seconds
- `yarn build` (full): 60-90 seconds
- `yarn typecheck`: 5-10 seconds

Times may vary based on system specifications and caching.

## Additional Commands

### Linting
```bash
yarn lint  # ESLint with auto-fix
```

### Testing
```bash
yarn test  # Run Vitest
```

### Development Mode
```bash
# Watch mode for continuous builds
./watch.sh

# Or use Make targets
make watch
```

## Support

For build issues:
1. Check this verification guide
2. Review error output carefully
3. Ensure prerequisites are met
4. Try clean install (remove node_modules and reinstall)
5. Check GitHub Actions logs for CI failures
