"use strict";

const {startProjectPath, aliasOptions} = require("../helpers");

const rule = require("../../../lib/rules/layer-imports"),
  RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester();
ruleTester.run("layer-imports", rule, {
  valid: [
    {
      filename: `${startProjectPath}\\widgets\\Sidebar\\index.tsx`,
      code: "import React from 'react'",
      options: [aliasOptions],
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\index.ts`,
      code: "import { Button } from '@/shared/ui/Button'",
      options: [aliasOptions],
    },
    {
      filename: `${startProjectPath}\\features\\Auth\\Auth.tsx`,
      code: "import { Article } from '@/entities/Article'",
      options: [aliasOptions],
    },
    {
      filename: `${startProjectPath}\\app\\providers\\StoreProvider.tsx`,
      code: "import { Sidebar } from '@/widgets/Sidebar'",
      options: [aliasOptions],
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\index.ts`,
      code: "import { schema } from '@/app/providers/StoreProvider'",
      options: [{
        ...aliasOptions,
        ignoreImportPatterns: ['**/app/providers/**']
      }],
    },
  ],

  invalid: [
    {
      filename: `${startProjectPath}\\entities\\Article\\utils.ts`,
      code: "import { AuthForm } from '@/features/Auth';",
      options: [aliasOptions],
      errors: [{
        message: "A layer can only import layers below it (app → pages → widgets → features → entities → shared)"
      }],
    },
    {
      filename: `${startProjectPath}\\widgets\\Sidebar\\index.tsx`,
      code: "import { HomePage } from '@/pages/Home';",
      options: [aliasOptions],
      errors: [{
        message: "A layer can only import layers below it (app → pages → widgets → features → entities → shared)"
      }],
    },
    {
      filename: `${startProjectPath}\\features\\Profile\\Profile.tsx`,
      code: "import { StoreProvider } from '@/app/providers/StoreProvider';",
      options: [aliasOptions],
      errors: [{
        message: "A layer can only import layers below it (app → pages → widgets → features → entities → shared)"
      }],
    },
  ],
});
