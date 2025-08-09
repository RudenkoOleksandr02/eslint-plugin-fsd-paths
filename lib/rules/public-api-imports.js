"use strict";

const path = require('path');
const { isPathRelative, stripAlias} = require("../helpers");
const micromatch = require("micromatch");

const PUBLIC_ERROR = 'PUBLIC_ERROR';
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR';

module.exports = {
  PUBLIC_ERROR,
  TESTING_PUBLIC_ERROR,
  meta: {
    type: null,
    docs: {
      description: "Enforce that imports use the public API (index.ts or testing.ts) of feature slices",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    messages: {
      [PUBLIC_ERROR]: 'Absolute import is allowed only from Public Api (index.ts)',
      [TESTING_PUBLIC_ERROR]: 'Test data must be imported from Public Api (testing.ts)',
    },
    schema: [{
      type: 'object',
      properties: {
        alias: { type: 'string' },
        testFilesPatterns: {
          type: 'array',
          items: { type: "string" },
        }
      }
    }],
  },

  create(context) {
    const {
      alias = '',
      testFilesPatterns = []
    } = context.options[0] ?? {};

    const checkingLayers = {
      pages: 'pages',
      widgets: 'widgets',
      features: 'features',
      entities: 'entities',
    };

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (!importPath) return;

        const normalizedPath = stripAlias(importPath, alias);

        if (isPathRelative(normalizedPath)) {
          return;
        }

        const segments = normalizedPath.split('/');
        const layer = segments[0];
        const slice = segments[1];

        if (!checkingLayers[layer]) {
          return;
        }

        const isImportFromDeep = segments.length > 2;
        const isTestingImport = segments[2] === 'testing' && segments.length === 3;

        if (isImportFromDeep && !isTestingImport) {
          const publicPath = alias ? `${alias}/${layer}/${slice}` : `${layer}/${slice}`;

          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => fixer.replaceText(node.source, `'${publicPath}'`)
          });

          return;
        }

        if (isTestingImport) {
          const currentFile = context.getFilename();
          if (!currentFile) return;

          const normalizedCurrentFile = path.normalize(currentFile).split(path.sep).join('/');

          const isTestingFile = testFilesPatterns.some(pattern => (
              micromatch.isMatch(normalizedCurrentFile, pattern) ||
              micromatch.isMatch(currentFile, pattern)
          ));

          if (!isTestingFile) {
            context.report({ node, messageId: TESTING_PUBLIC_ERROR });
          }
        }
      }
    };
  },
};
