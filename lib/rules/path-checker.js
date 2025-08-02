"use strict";

const path = require('path');
const {isPathRelative} = require("../helpers");

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Enforce relative imports within the same feature slice",
      recommended: false,
      url: null,
    },
    fixable: null,
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
        const normalizedPath = alias
            ? importPath.replace(`${alias}/`, '')
            : importPath;
        const currentFile = context.getFilename();

        if (shouldBeRelative(currentFile, normalizedPath)) {
          context.report(node, `Within a single feature slice, all paths must be relative`);
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

function shouldBeRelative(currentFile, importFile) {
  if (isPathRelative(importFile)) {
    return false;
  }

  const importFileArray = importFile.split('/');
  const importFileLayer = importFileArray[0];
  const importFileSlice = importFileArray[1];

  if (!importFileLayer || !importFileSlice || !layers[importFileLayer]) {
    return false;
  }

  const normalizedCurrentFile = path.toNamespacedPath(currentFile);
  const projectCurrentFile = normalizedCurrentFile.split('src')[1];

  const projectCurrentFileArray = projectCurrentFile.split('\\');
  const projectCurrentFileLayer = projectCurrentFileArray[1];
  const projectCurrentFileSlice = projectCurrentFileArray[2];

  if (!projectCurrentFileLayer || !projectCurrentFileSlice || !layers[projectCurrentFileLayer]) {
    return false;
  }

  return importFileLayer === projectCurrentFileLayer && importFileSlice === projectCurrentFileSlice;
}