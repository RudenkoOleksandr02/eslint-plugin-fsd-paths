## eslint-plugin-fsd-paths

ESLint plugin for enforcing import path rules in Feature‑Sliced Design (FSD) projects.

---

### Installation

Install ESLint if you haven’t already:

```sh
npm install --save-dev eslint
```

Then install the plugin:

```sh
npm install --save-dev @sashar/eslint-plugin-fsd-paths
```

### Usage

In your ESLint config (`.eslintrc.js` or `.eslintrc.json`):

```js
// .eslintrc.js
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

* **Option:** `alias` (`string`) — your project alias (e.g. `"@"`).

**Valid:**

```js
// same slice, relative
import { helper } from '../model/slice/helper';
```

**Invalid:**

```js
// deep or absolute import within slice
import { helper } from '@/features/MyFeature/model/helper';
```

### 2. `public-api-imports`

**Purpose:** Allow only public API (index.ts) or, in test files, testing API (testing.ts) imports from other slices.

* **Options:**

  * `alias` (`string`)
  * `testFilesPatterns` (`string[]`) — glob patterns for test files.

**Allowed:**

```js
// public API
import { getUser } from '@/entities/User';

// testing API in matching test files
import { mockUser } from '@/entities/User/testing';
```

**Errors:**

```js
// deep import outside index.ts
import { api } from '@/entities/User/model/api'; // ✕

// testing import in non-test file
import { mock } from '@/entities/User/testing'; // ✕
```

### 3. `layer-imports`

**Purpose:** Enforce allowed import directions between layers:

```
app → pages → widgets → features → entities → shared
```

* **Options:**

  * `alias` (`string`)
  * `ignoreImportPatterns` (`string[]`) — glob patterns to skip.

**Valid:**

```js
// features → entities
import { Article } from '@/entities/Article';

// entities → shared
import { Button } from '@/shared/ui/Button';

// entities → entities (importing a different slice under the same layer)
import { Comment } from '@/entities/Comment';

// shared → shared (importing a different module under shared)
import { logger } from '@/shared/lib/logger';
```

> 💡 Note: cross-slice imports within the *same layer* are allowed **only** for `entities` and `shared` layers.

**Error:**

```js
// entities → features (not allowed)
import { AuthForm } from '@/features/Auth';
```

---

## Global Notes

* **Without an alias (not recommended):**

  ```js
  // e.g. "entities/Article" directly, but may clash
  // with node_modules packages of the same name.
  import { Article } from 'entities/Article';
  ```
