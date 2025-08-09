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
    },
    {
      filename: `${startProjectPath}/entities/Article/ui/ArticleCard.tsx`,
      code: "import { addCommentFormActions } from '../../model/slice/addCommentFormSlice.ts'",
      errors: [],
    },
    {
      filename: `${startProjectPath}/entities/Article/index.ts`,
      code: "import { getArticle } from './model/selectors/getArticle'",
      errors: [],
    },
  ],
  invalid: [
    {
      filename: `${startProjectPath}\\entities\\Article\\ui\\ArticleCard.tsx`,
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slice/addCommentFormSlice.ts'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      options: [aliasOptions],
      output: "import { addCommentFormActions, addCommentFormReducer } from '../model/slice/addCommentFormSlice.ts'",
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\ui\\ArticleCard.tsx`,
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slice/addCommentFormSlice.ts'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      output: "import { addCommentFormActions, addCommentFormReducer } from '../model/slice/addCommentFormSlice.ts'",
    },
    {
      filename: `${startProjectPath}\\entities\\Article\\index.ts`,
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slice/addCommentFormSlice.ts'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      output: "import { addCommentFormActions, addCommentFormReducer } from './model/slice/addCommentFormSlice.ts'",
    },
    {
      filename: `${startProjectPath}/features/Profile/ui/ProfileCard.tsx`,
      code: "import { updateProfile } from '@/features/Profile/model/services/updateProfile'",
      options: [aliasOptions],
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      output: "import { updateProfile } from '../model/services/updateProfile'",
    },
    {
      filename: `${startProjectPath}/widgets/Header/ui/Header.tsx`,
      code: "import { Logo } from 'widgets/Header/ui/Logo'",
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      output: "import { Logo } from './Logo'",
    },
    {
      filename: `${startProjectPath}/app/providers/router/ui/AppRoute.tsx`,
      code: "import { RequireAuth } from '@/app/providers/router/ui/RequireAuth'",
      options: [aliasOptions],
      errors: [{ message: "Within a single feature slice, all paths must be relative" }],
      output: "import { RequireAuth } from './RequireAuth'",
    },
  ],
});
