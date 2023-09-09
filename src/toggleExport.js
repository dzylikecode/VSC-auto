const vscode = require("vscode");

function toggleExport() {
  const editor = vscode.window.activeTextEditor;
  editor.edit((edit) => {
    const current = editor.selection;
    const selectText = editor.document.getText(editor.selection);

    if (isExport(selectText)) {
      edit.replace(current, stripExport(selectText));
    } else {
      edit.replace(current, wrapExport(selectText));
    }
  });
}

function isExport(str) {
  const strStrip = str.trim();
  return (
    strStrip.startsWith("<docs-expose>") && strStrip.endsWith("</docs-expose>")
  );
}

function stripExport(str) {
  return str.replace(/<docs-expose>/g, "").replace(/<\/docs-expose>/g, "");
}

function wrapExport(str) {
  return `\n\n<docs-expose>\n\n${str}\n\n</docs-expose>\n\n`;
}

module.exports = {
  toggleExport,
};
