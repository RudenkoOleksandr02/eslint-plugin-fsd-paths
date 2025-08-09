"use strict";

const path = require('path');
const { isPathRelative, stripAlias, getNormalizedCurrentFilePath} = require("../helpers");

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Enforce relative imports within the same feature slice",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias ?? '';

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const normalizedImportPath = stripAlias(importPath, alias);
        const currentFilePath = context.getFilename();

        if (shouldBeRelative(currentFilePath, normalizedImportPath)) {
          context.report({
            node,
            message: `Within a single feature slice, all paths must be relative`,
            fix: (fixer) => {
              const normalizedCurrentFilePath = getNormalizedCurrentFilePath(currentFilePath);
              const pathToDirectory = normalizedCurrentFilePath
                  .split('/')
                  .slice(0, -1)
                  .join('/');

              let relativePath = path.posix.relative(pathToDirectory, normalizedImportPath);

              if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
              }

              return fixer.replaceText(node.source, `'${relativePath}'`);
            }
          });
        }
      }
    };
  },
};

const layers = {
  pages: 'pages',
  widgets: 'widgets',
  entities: 'entities',
  features: 'features',
  shared: 'shared',
};

function shouldBeRelative(currentFilePath, importFilePath) {
  if (isPathRelative(importFilePath)) {
    return false;
  }

  const importFileArray = importFilePath.split('/');
  const importFileLayer = importFileArray[0];
  const importFileSlice = importFileArray[1];

  if (!importFileLayer || !importFileSlice || !layers[importFileLayer]) {
    return false;
  }

  const normalizedCurrentFilePath = getNormalizedCurrentFilePath(currentFilePath);
  if (!normalizedCurrentFilePath) return false;

  const projectCurrentFileArray = normalizedCurrentFilePath.split('/');
  const projectCurrentFileLayer = projectCurrentFileArray[0];
  const projectCurrentFileSlice = projectCurrentFileArray[1];

  if (!projectCurrentFileLayer || !projectCurrentFileSlice || !layers[projectCurrentFileLayer]) {
    return false;
  }

  return importFileLayer === projectCurrentFileLayer && importFileSlice === projectCurrentFileSlice;
}
