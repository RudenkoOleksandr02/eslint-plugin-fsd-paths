"use strict";

const {startProjectPath, aliasOptions} = require("../helpers");

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename: `${startProjectPath}\\entities\\Article\\ui\\ArticleCard.tsx`,
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slice/addCommentFormSlice.ts'",
      errors: [],
    }
  ],
  invalid: [
    {
      filename: `${startProjectPath}\\entities\\Article\\ui\\ArticleCard.tsx`,
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slice/addCommentFormSlice.ts'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      options: [aliasOptions]
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\ui\\ArticleCard.tsx`,
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slice/addCommentFormSlice.ts'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
    },
  ],
});
