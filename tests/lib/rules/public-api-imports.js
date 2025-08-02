"use strict";

const {startProjectPath, aliasOptions} = require("../helpers");

const rule = require("../../../lib/rules/public-api-imports"),
  RuleTester = require("eslint").RuleTester;

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
      errors: [{ message: "Absolute import is allowed only from Public Api (index.ts)" }],
      options: [aliasOptions]
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\StoreDecorator.tsx`,
      code: "import { bar } from '@/entities/Article/testing/foo.tsx'",
      errors: [{ message: "Absolute import is allowed only from Public Api (index.ts)" }],
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\utils.ts`,
      code: "import { data } from '@/entities/Article/testing'",
      errors: [{ message: "Test data must be imported from Public Api (testing.ts)" }],
      options: [{ ...aliasOptions, testFilesPatterns: testPatterns }],
    },
  ],
});
