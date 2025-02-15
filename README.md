[![npm](https://img.shields.io/npm/v/ng-extract-i18n-merge)](https://www.npmjs.com/package/ng-extract-i18n-merge)
[![Coverage Status](https://coveralls.io/repos/github/daniel-sc/ng-extract-i18n-merge/badge.svg?branch=master)](https://coveralls.io/github/daniel-sc/ng-extract-i18n-merge?branch=master)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/daniel-sc/ng-extract-i18n-merge.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/daniel-sc/ng-extract-i18n-merge/context:javascript)

# Angular extract i18n and merge

This extends Angular CLI to improve the i18n extraction and merge workflow. New/removed translations are added/removed
from the target translation files. Additionally, translation files are normalized (pretty print, sorted by id) so that
diffs are easy to read (and translations in PRs might actually get reviewd ;-) ).

## Install

_Prerequisites_: i18n setup with defined target locales in `angular.json` - as
documented [here](https://angular.io/guide/i18n-common-merge).

```shell
ng add ng-extract-i18n-merge
```

## Usage

```shell
ng run [PROJECT_ID]:extract-i18n-merge
# or (if you confirmed to adding an npm command):
npm run extract-i18n-merge 
```

### Configuration

In your `angular.json` you'll find a new target `extract-i18n-merge` that can be configured with the following options:

| Name                         | Default                                                     | Description                                                                                                                                                                 |
|------------------------------|-------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `format`                     | Inferred from current setup by `ng add`                     | Any of `xlf`, `xlif`, `xliff`, `xlf2`, `xliff2`                                                                                                                             |
| `outputPath`                 | Inferred from current setup by `ng add`                     | Path to folder containing all (source and target) translation files.                                                                                                        |
| `targetFiles`                | Inferred from current setup by `ng add`                     | Filenames (relative to `outputPath` of all target translation files (e.g. `["messages.fr.xlf", "messages.de.xlf"]`).                                                        |
| `sourceLanguageTargetFile`   | Unused                                                      | If this is set (to one of the `targetFiles`), new translations in that target file will be set to `state="final"` (instead of default `state="new"`).                       |
| `sourceFile`                 | `messages.xlf`. `ng add` tries to infer non default setups. | Filename (relative to `outputPath` of source translation file (e.g. `"translations-source.xlf"`).                                                                           |
| `removeIdsWithPrefix`        | `[]`                                                        | List of prefix strings. All translation units with matching `id` attribute are removed. Useful for excluding duplicate library translations.                                |
| `fuzzyMatch`                 | `true`                                                      | Whether translation units without matching IDs are fuzzy matched by source text.                                                                                            |
| `resetTranslationState`      | `true`                                                      | Reset the translation state to new/initial for new/changed units.                                                                                                           |
| `collapseWhitespace`         | `true`                                                      | Collapsing of multiple whitespaces and trimming when comparing translations sources.                                                                                        |
| `includeContext`             | `false`                                                     | Whether to include the context information (like notes) in the translation files. This is useful for sending the target translation files to translation agencies/services. |
| `newTranslationTargetsBlank` | `false`                                                     | When `false` (default) the "target" of new translation units is set to the "source" value. When `true` an empty string is used.                                             |

## Contribute

Feedback and PRs always welcome :-)
