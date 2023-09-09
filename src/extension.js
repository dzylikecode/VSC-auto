const vscode = require("vscode");
const g = require("./generate/generateCache.js");
const d = require("./generateDocs.js");
const { openLeft, openRight } = require("./openFile.js");
const logger = require("./logger.js");
const { getWorkspaceFolderPath, mapToVirtual } = require("./utils.js");
const config = require("./config.js");
const path = require("path");
const { toggleExport } = require("./toggleExport.js");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  logger.init();
  logger.log('Congratulations, "dstUtils" is now active!');
  config.loadConfig();

  vscode.workspace.onDidChangeConfiguration(() => {
    config.loadConfig();
  });

  vscode.workspace.onDidSaveTextDocument((document) => {
    onSave(document.uri);
  });

  vscode.workspace.onDidDeleteFiles((fileDeleteEvent) => {
    fileDeleteEvent.files.forEach((f) => onDelete(f));
  });

  vscode.workspace.onDidRenameFiles((fileRenameEvent) => {
    fileRenameEvent.files.forEach((f) => {
      onDelete(f.oldUri);
      onSave(f.newUri);
    });
  });

  const registerCommand = (menu, fn) =>
    context.subscriptions.push(vscode.commands.registerCommand(menu, fn));
  // registerCommand("dstutils.openSrc", () =>
  //   openSrc(vscode.window.activeTextEditor.document.uri)
  // );
  // registerCommand("dstutils.openDst", () =>
  //   openDst(vscode.window.activeTextEditor.document.uri)
  // );
  registerCommand("dstutils.compare", () =>
    openCompare(vscode.window.activeTextEditor.document.uri)
  );
  registerCommand("dstutils.generateSummary", () =>
    generateSummary(vscode.window.activeTextEditor.document.uri)
  );
  // registerCommand("dstutils.generateMarkdown", () =>
  //   generateDocs(vscode.window.activeTextEditor.document.uri)
  // );
  registerCommand("dstutils.createDst", () =>
    generateDst(vscode.window.activeTextEditor.document.uri)
  );
  registerCommand("dstutils.toggleExport", () => toggleExport());
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

/**
 *
 * @param {vscode.Uri} uri
 */
async function onSave(uri) {
  const filePath = uri.fsPath;
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = mapToVirtual(filePath, workspaceFolderPath, config.cacheRule);
  if (!res) return;

  try {
    await g.generate(res.srcFile, res.dstFile, res.virtualName);
    logger.log(`${res.srcFile} -> ${res.dstFile}`);
  } catch (err) {
    logger.log(err);
  }
}
/**
 *
 * @param {vscode.Uri} uri
 */
async function onDelete(uri) {
  const filePath = uri.fsPath;
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = mapToVirtual(filePath, workspaceFolderPath, config.cacheRule);
  if (!res) return;

  try {
    await g.remove(res.dstFile);
    logger.log(`remove ${res.dstFile}`);
  } catch (err) {
    logger.log(err);
  }
}

function openFile(filePath, position) {
  if (position === "left") {
    return openLeft(filePath);
  }
  if (position === "right") {
    return openRight(filePath);
  }
}

// function openSrc(uri) {
//   const filePath = uri.fsPath;
//   const workspaceFolderPath = getWorkspaceFolderPath(uri);
//   const res = mapToVirtual(filePath, workspaceFolderPath, config.srcRule);
//   if (res) {
//     return openFile(res.dstFile, res.rule.dst.position);
//   }
//   const forceRes = mapToVirtual(filePath, workspaceFolderPath, config.dstRule);
//   if (forceRes) {
//     return openFile(forceRes.dstFile, forceRes.rule.dst.position);
//   }
//   logger.log(`${filePath} has been excluded or not match any rule`);
// }

// function openDst(uri) {
//   const filePath = uri.fsPath;
//   const workspaceFolderPath = getWorkspaceFolderPath(uri);
//   const res = mapToVirtual(filePath, workspaceFolderPath, config.dstRule);
//   if (res) {
//     return openFile(res.dstFile, res.rule.dst.position);
//   }
//   const forceRes = mapToVirtual(filePath, workspaceFolderPath, config.srcRule);
//   if (forceRes) {
//     return openFile(forceRes.dstFile, forceRes.rule.dst.position);
//   }
//   logger.log(`${filePath} has been excluded or not match any rule`);
// }

function openCompare(uri) {
  const filePath = uri.fsPath;
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = mapToVirtual(filePath, workspaceFolderPath, config.dstRule);
  if (res) {
    return openBoth(res);
  }
  const forceRes = mapToVirtual(filePath, workspaceFolderPath, config.srcRule);
  if (forceRes) {
    return openBoth(forceRes);
  }
  logger.log(`${filePath} has been excluded or not match any rule`);
  function openBoth(match) {
    openFile(match.dstFile, match.rule.dst.position);
    openFile(match.srcFile, match.rule.src.position);
  }
}

function generateSummary(uri) {
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = config.mapRules.map((r) => ({
    mdDir: getFullPath(r.cache.src.dir),
  }));
  res.forEach((r) => {
    d.generateSummary(r.mdDir, workspaceFolderPath);
  });
  logger.log("generate Summary done");
  function getFullPath(dir) {
    return path.join(workspaceFolderPath, dir);
  }
}

function generateDocs(uri) {
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = config.mapRules.map((r) => ({
    mdDir: getFullPath(r.cache.src.dir),
    codeDir: getFullPath(r.src.dir),
    ext: r.src.ext,
  }));
  res.forEach((r) => {
    d.generateDocs(r.mdDir, r.codeDir, workspaceFolderPath, r.ext);
  });
  logger.log("generate Markdown done");
  function getFullPath(dir) {
    return path.join(workspaceFolderPath, dir);
  }
}

function generateDst(uri) {
  const filePath = uri.fsPath;
  const workspaceFolderPath = getWorkspaceFolderPath(uri);
  const res = mapToVirtual(filePath, workspaceFolderPath, config.dstRule);
  if (!res) {
    logger.log(`${filePath} not match any rule or excluded`);
    return;
  }
  return d.createMdFile(res.dstFile, res.rule.src.ext);
}
