"use strict";

const {isPathRelative} = require("../helpers");
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
        alias: {
          type: 'string'
        },
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
      entities: 'entities',
      features: 'features',
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const normalizedPath = alias
            ? importPath.replace(`${alias}/`, '')
            : importPath
        ;

        if (isPathRelative(normalizedPath)) {
          return;
        }

        const segments = normalizedPath.split('/');
        const layer = segments[0];
        const slice = segments[1];

        if (!checkingLayers[layer]) {
          return;
        }

        const isImportFromPublicApi = segments.length > 2;
        const isTestingImport  = segments[2] === 'testing' && segments.length < 4;

        if (isImportFromPublicApi && !isTestingImport) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`)
            }
          });
        }

        if (isTestingImport) {
          const currentFile = context.getFilename();
          const isTestingFile = testFilesPatterns.some(
              pattern => micromatch.isMatch(currentFile, pattern)
          );

          if (!isTestingFile) {
            context.report({node, messageId: TESTING_PUBLIC_ERROR});
          }
        }
      }
    };
  },
};
