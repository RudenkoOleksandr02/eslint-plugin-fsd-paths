"use strict";

const path = require("path");

function isPathRelative(p) {
    return typeof p === "string" && (p === "." || p.startsWith("./") || p.startsWith("../"));
}

function stripAlias(value, aliasValue) {
    if (!aliasValue || typeof value !== "string") return value;

    const ali = aliasValue.endsWith("/") ? aliasValue.slice(0, -1) : aliasValue;

    if (value === ali || value === `${ali}/`) return "";
    if (value.startsWith(ali + "/")) return value.slice(ali.length + 1);
    if (value.startsWith(ali)) return value.slice(ali.length);

    return value;
}

function normalizeToPosix(p) {
    if (!p || typeof p !== "string") return p;
    const replaced = p.replace(/\\/g, "/");

    return path.posix.normalize(replaced);
}

function getPartsAfterSrc(filePath) {
    if (!filePath || typeof filePath !== "string") return null;

    const normalized = normalizeToPosix(filePath);
    const parts = normalized.split("/").filter(Boolean);
    const srcIndex = parts.indexOf("src");

    if (srcIndex === -1) return null;

    return parts.slice(srcIndex + 1);
}

function getCurrentFileLayer(filePath) {
    const parts = getPartsAfterSrc(filePath);
    if (!parts || parts.length === 0) return null;

    return parts[0];
}

function getImportLayer(importPath, alias = "") {
    if (!importPath || typeof importPath !== "string") return null;
    if (isPathRelative(importPath)) return null;

    const withoutAlias = stripAlias(importPath, alias);
    const normalized = normalizeToPosix(withoutAlias);
    const segments = normalized.split("/").filter(Boolean);

    return segments[0] ?? null;
}

function getNormalizedCurrentFilePath(filePath) {
    const parts = getPartsAfterSrc(filePath);
    if (!parts) return null;

    return parts.join("/");
}

module.exports = {
    isPathRelative,
    stripAlias,
    normalizeToPosix,
    getPartsAfterSrc,
    getCurrentFileLayer,
    getImportLayer,
    getNormalizedCurrentFilePath,
};
