# Change Log

## [Unreleased]

## [1.4.2] - 2020-11-03
### Added
 - more opportunities of completion: whenever a trigger of a completion item provider captures transformed content, that same content is fed into a definition provider. Useful when you need to suggest slot names of custom components.

## [1.4.1] - 2020-10-28
### Fixed
 - fixed a bug on completion item providers throwing an exception on a trigger regexp containing optional captures.

## [1.4.0] - 2020-10-10
### Added
 - transformer `flatten-json`;
 - in completion item providers, the `contentRegexp` can use placeholders such as `$1`, `$2`, ..., `$n`. They will be replaced by the capture group values from the `triggerRegexp` (if any).

## [1.3.1] - 2020-09-22
### Fixed
 - fixed a bug on navigating to definition when the `es6-module-nodes` transformer is used.

## [1.3.0] - 2020-08-26
### Added
 - transformers `flatten-html`.
 - completion item prefix and suffix.

## [1.2.0] - 2020-08-19
### Added
 - 3 transformers: `es6-module-nodes`, `camelcase-to-kebabcase`, `kebabcase-to-camelcase`.
 - Verbose logging via the `debug` setting.

## [1.1.0] - 2020-07-29
### Added
 - Reference providers.
 - Support for `${definition...}` placeholders in glob patterns for completion item providers.
 - Hot configuration reload.

## [1.0.0] - 2020-07-26
### Added
 - Completion item providers.
 - Definition providers.

[Unreleased]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.4.2...HEAD
[1.4.2]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/BrightSoul/vscode-html-configurable-autocomplete/releases/tag/v1.0.0