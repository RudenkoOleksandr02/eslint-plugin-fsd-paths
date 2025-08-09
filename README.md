# eslint-plugin-fsd-paths

ESLint plugin for enforcing import path rules in Feature‑Sliced Design (FSD) projects. Keeps import paths consistent: relative imports inside a slice, public API usage between slices, and correct layer ordering.

---

## Requirements

* Project structure: `src/{app,pages,widgets,features,entities,shared}`
* `alias` should be provided without a trailing slash, e.g. `@`

---

## Installation

Install ESLint (if not already):

```bash
npm install --save-dev eslint
```

Install the plugin:

```bash
npm install --save-dev @sashar/eslint-plugin-fsd-paths
```

---

## Usage

Add the plugin and rules to your ESLint config (example `.eslintrc.js`):

```js
module.exports = {
  plugins: ['@sashar/fsd-paths'],
  rules: {
    // 1. Relative imports within the same slice
    '@sashar/fsd-paths/path-checker': ['error', { alias: '@' }],

    // 2. Public API entry-point imports
    '@sashar/fsd-paths/public-api-imports': ['error', {
      alias: '@',
      testFilesPatterns: ['**/*.test.*', '**/*.spec.*']
    }],

    // 3. Layered import order (app → pages → widgets → features → entities → shared)
    '@sashar/fsd-paths/layer-imports': ['error', {
      alias: '@',
      ignoreImportPatterns: ['**/styles/**', '**/StoreProvider']
    }]
  }
};
```

---

## Rules

### 1. `path-checker`

**Purpose:** Ensure imports within the same feature slice use relative paths.

**Option:** `alias` (`string`) — your project alias (e.g. `"@"`).

**Valid:**

```js
// same slice, relative
import { helper } from '../model/helper';
```

**Invalid:**

```js
// deep or absolute import within slice
import { helper } from '@/features/MyFeature/model/helper';
```

**Auto-fix:**
Running ESLint with `--fix` will convert deep absolute imports into relative ones.

---

### 2. `public-api-imports`

**Purpose:** Enforce imports from other slices go through the public API (`index.ts`). Test files may import from `testing.ts`.

**Options:**

* `alias` (`string`)
* `testFilesPatterns` (`string[]`) — glob patterns for test files

**Valid:**

```js
// public API
import { getUser } from '@/entities/User';

// testing API in test files
import { mockUser } from '@/entities/User/testing';
```

**Invalid:**

```js
// deep import outside index.ts
import { api } from '@/entities/User/model/api'; // ✕

// testing API import in non-test file
import { mock } from '@/entities/User/testing'; // ✕
```

**Auto-fix:**
`--fix` will replace deep imports with the public API import, e.g. `@/entities/User`.

---

### 3. `layer-imports`

**Purpose:** Enforce allowed import directions between layers.

Allowed flow:

```
app → pages → widgets → features → entities → shared
```

**Options:**

* `alias` (`string`)
* `ignoreImportPatterns` (`string[]`) — glob patterns to skip

**Examples — allowed:**

```js
// features → entities
import { Article } from '@/entities/Article';

// entities → shared
import { Button } from '@/shared/ui/Button';

// entities → entities (different slice)
import { Comment } from '@/entities/Comment';

// shared → shared
import { logger } from '@/shared/lib/logger';
```

> Note: Cross-slice imports inside the same layer are allowed only for `entities` and `shared`.

**Invalid example:**

```js
// entities → features (not allowed)
import { AuthForm } from '@/features/Auth';
```

---

## Recommendations

* Use an alias (e.g. `@`) to avoid conflicts with `node_modules`.
* Configure `testFilesPatterns` to match your test files (Jest, Vitest, etc.).
* Add `ignoreImportPatterns` for styles or special provider modules that should be excluded from checks.

---

## CLI

Run ESLint for a file:

```bash
npx eslint path/to/file.ts
```

Run with auto-fix:

```bash
npx eslint --fix path/to/file.ts
```

