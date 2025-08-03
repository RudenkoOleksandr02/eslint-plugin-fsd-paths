"use strict";

const {startProjectPath, aliasOptions} = require("../helpers");

const rule = require("../../../lib/rules/public-api-imports"),
  RuleTester = require("eslint").RuleTester;
const {PUBLIC_ERROR, TESTING_PUBLIC_ERROR} = rule;

const testPatterns = ['**/*.test.ts', '**/*.story.tsx', '**/StoreDecorator.tsx'];

const ruleTester = new RuleTester();
ruleTester.run("public-api-imports", rule, {
  valid: [
    {
      code: "import { foo } from '@/entities/Article'",
      options: [aliasOptions]
    },
    {
      code: "import { helper } from '../../model/slice/helperSlice'",
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\Article.test.ts`,
      code: "import { testData } from '@/entities/Article/testing'",
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\StoreDecorator.tsx`,
      code: "import { decorator } from '@/entities/Article/testing'",
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
    },
  ],

  invalid: [
    {
      code: "import { foo } from '@/entities/Article/model/slice/fooSlice'",
      errors: [{ messageId: PUBLIC_ERROR }],
      options: [aliasOptions],
      output: "import { foo } from '@/entities/Article'",
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\StoreDecorator.tsx`,
      code: "import { bar } from '@/entities/Article/testing/foo.tsx'",
      errors: [{ messageId: PUBLIC_ERROR }],
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
      output: "import { bar } from '@/entities/Article'",
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\utils.ts`,
      code: "import { data } from '@/entities/Article/testing'",
      errors: [{ messageId: TESTING_PUBLIC_ERROR }],
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
    },
  ],
});
