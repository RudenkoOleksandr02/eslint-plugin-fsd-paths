"use strict";

const micromatch = require("micromatch");
const { isPathRelative, stripAlias, getCurrentFileLayer, getImportLayer} = require("../helpers");

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "Enforce that each layer may only import from allowed lower-level layers",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [{
      type: "object",
      properties: {
        alias: { type: "string" },
        ignoreImportPatterns: { type: "array", items: { type: "string" } }
      }
    }],
  },

  create(context) {
    const allowedImports = {
      app: ['pages', 'widgets', 'features', 'entities', 'shared'],
      pages: ['widgets', 'features', 'entities', 'shared'],
      widgets: ['features', 'entities', 'shared'],
      features: ['entities', 'shared'],
      entities: ['shared', 'entities'],
      shared: ['shared'],
    };

    const validLayers = {
      app: 'app',
      entities: 'entities',
      features: 'features',
      shared: 'shared',
      pages: 'pages',
      widgets: 'widgets',
    };

    const {
      alias = '',
      ignoreImportPatterns = []
    } = context.options[0] ?? {};

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (!importPath || isPathRelative(importPath)) return;

        const withoutAlias = stripAlias(importPath, alias);
        const isIgnored = ignoreImportPatterns.some(pattern =>
            micromatch.isMatch(importPath, pattern) || micromatch.isMatch(withoutAlias, pattern)
        );
        if (isIgnored) return;

        const currentFileLayer = getCurrentFileLayer(context.getFilename());
        const importLayer = getImportLayer(importPath, alias);

        if (!currentFileLayer || !importLayer) return;
        if (!validLayers[importLayer] || !validLayers[currentFileLayer]) return;

        if (!allowedImports[currentFileLayer]?.includes(importLayer)) {
          context.report({
            node,
            message: 'A layer can only import layers below it (app → pages → widgets → features → entities → shared)'
          });
        }
      }
    };
  },
};
