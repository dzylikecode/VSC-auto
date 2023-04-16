# dstutils

help write Don't Starve Docs

## Features

- update/delete/rename cache file when you save/delete/rename file automatically
- context menu:
  - generate the Markdown file in the `mdDir` directory which is corresponding to the code file
  - generate the `SUMMARY.md` file associated with the `mdDir` directory
  - open the Markdown corresponding to the code file when the code file is focused
  - open the code file corresponding to the Markdown file when the Markdown file is focused

## Settings

- `dstutils.mapRules`: `[object]`

  each object is a rule:

  - `mdDir`: `string`

    the directory where the Markdown file is located

  - `cacheDir`: `string`

    the directory where the cache file is located

  - `codeDir`: `string`

    the directory where the code file is located

  - `exclude`: `string[]`

    the file name that will not generate the cache file

  - `ext`: `string`

    the file extension of the code file

### example

```json
{
  "dstutils.mapRules": [
    {
      "mdDir": "docs/",
      "cacheDir": "assets/cache/",
      "codeDir": "code/",
      "exclude": ["README", "SUMMARY"],
      "ext": ".lua"
    }
  ]
}
```

## NOTE

Force newlines to be `LF`(used in Linux/Mac) instead of CRLF(used in Windows), so recommend Windows users to work in the WSL(Windows Subsystem for Linux) environment. Another way is to configure `git` and `VSCode` to convert CRLF to LF automatically:

The below forces `git` to convert CRLF to LF automatically:

```bash
git config --global core.autocrlf true
```

The below forces VSCode to use LF when creating new files:

```json
{
  "files.eol": "\n"
}
```

## References

1. [emeraldwalk/vscode-runonsave: Visual Studio Code extension to run commands whenever a file is saved.](https://github.com/emeraldwalk/vscode-runonsave)
2. [How to Get Consistent Line Breaks in vs Code (LF vs CRLF) | Boot.dev](https://blog.boot.dev/clean-code/line-breaks-vs-code-lf-vs-crlf/)
