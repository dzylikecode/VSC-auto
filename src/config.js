const vscode = require("vscode");

class ExtensionConfig {
  constructor() {}
  loadConfig() {
    this._config = vscode.workspace.getConfiguration("dstutils");
    this.srcRule = this.mapRules.map((c) => ({
      src: c.dst,
      dst: c.src,
      exclude: c.exclude,
    }));
    this.dstRule = this.mapRules;
    this.cacheRule = this.mapRules.map((c) => ({
      ...c.cache,
      exclude: c.exclude,
    }));
  }
  /**
   * @return {{  src:{dir: string,ext: string,position: string},dst: {    dir: string,    ext: string,    position: string  },  cache: {    src: {dir: string,ext: string},    dst:{dir: string,ext: string}},    exclude?: string[]}[]}
   */
  get mapRules() {
    return this._config.get("mapRules");
  }
}

module.exports = new ExtensionConfig();
