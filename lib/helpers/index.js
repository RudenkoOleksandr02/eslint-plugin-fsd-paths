"use strict";

const path = require("path");

const layers = {
    app: 'app',
    pages: 'pages',
    widgets: 'widgets',
    entities: 'entities',
    features: 'features',
    shared: 'shared',
};

function normalizeToPosix(p) {
    if (!p || typeof p !== "string") return p;
    return path.posix.normalize(p.replace(/\\/g, "/"));
}

function isPathRelative(p) {
    return typeof p === "string" &&
        (p === "." || p.startsWith("./") || p.startsWith("../"));
}

function stripAlias(value, aliasValue) {
    if (!aliasValue) return value;

    const ali = aliasValue.endsWith("/") ? aliasValue.slice(0, -1) : aliasValue;

    if (value === ali || value === `${ali}/`) return "";
    if (value.startsWith(ali + "/")) return value.slice(ali.length + 1);
    if (value.startsWith(ali)) return value.slice(ali.length);

    return value;
}

function getPartsAfterSrc(filePath) {
    if (!filePath) return null;

    const normalized = normalizeToPosix(filePath);
    const parts = normalized.split("/").filter(Boolean);
    const srcIndex = parts.indexOf("src");

    return srcIndex === -1 ? null : parts.slice(srcIndex + 1);
}

function getCurrentFileLayer(filePath) {
    const parts = getPartsAfterSrc(filePath);
    return parts?.[0] ?? null;
}

function getImportLayer(importPath, alias = "") {
    if (!importPath || isPathRelative(importPath)) return null;

    const withoutAlias = stripAlias(importPath, alias);
    const segments = withoutAlias.split("/").filter(Boolean);

    return segments[0] ?? null;
}

function getNormalizedCurrentFilePath(filePath) {
    const parts = getPartsAfterSrc(filePath);
    return parts?.join("/") ?? null;
}

module.exports = {
    layers,
    isPathRelative,
    stripAlias,
    normalizeToPosix,
    getPartsAfterSrc,
    getCurrentFileLayer,
    getImportLayer,
    getNormalizedCurrentFilePath,
};
