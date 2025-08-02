"use strict";

const path = require('path');
const {isPathRelative} = require("../helpers");
const micromatch = require("micromatch");

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
        alias: {
          type: "string",
        },
        ignoreImportPatterns: {
          type: "array",
          items: { type: "string" },
        }
      }
    }],
  },

  create(context) {
    const allowedImports = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const validLayers = {
      'app': 'app',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }

    const {
      alias = '',
      ignoreImportPatterns = []
    } = context.options[0] ?? {};

    const getCurrentFileLayer = () => {
      const currentFile = context.getFilename();
      const normalizedPath = path.toNamespacedPath(currentFile);
      const projectPath = normalizedPath?.split('src')[1];
      const segments = projectPath?.split('\\');

      return segments?.[1];
    }

    // Определяет слой импорта
    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value;
      const segments = importPath?.split('/');

      return segments?.[0];
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        const currentFileLayer = getCurrentFileLayer();
        const importLayer = getImportLayer(importPath);

        if (isPathRelative(importPath)) {
          return;
        }

        if (!validLayers[importLayer] || !validLayers[currentFileLayer]) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => (
            micromatch.isMatch(importPath, pattern)
        ));

        if (isIgnored) {
          return;
        }

        if (!allowedImports[currentFileLayer]?.includes(importLayer)) {
          context.report(node, 'A layer can only import layers below it (app → pages → widgets → features → entities → shared)')
        }
      }
    };
  },
};
