# Third-party notices

Original course submissions retain their own rights. This package links to their authors and does not include their original videos or complete research archives. See `docs/source-audit.md` for contributor links and the review boundary.

## Fonts

Fonts in `dist/assets/fonts/` were obtained from the local Partitioning coordinator archive. Newsreader, JetBrains Mono, Noto Sans, Noto Sans SC and Noto Serif SC retain the SIL Open Font License notices beside the font files (`OFL-*.txt`). Font authors and copyright statements are in those notices. No ownership of these fonts is claimed.

## Browser Python

Pyodide 0.28.3 is included locally in `dist/vendor/pyodide/`. Its MPL-2.0 license is retained as `LICENSE`. The Python standard library retains `LICENSE-CPython.txt`, including the PSF and historical notices. These components were extracted from the local Partitioning coordinator archive, not newly authored by this project. Pyodide sources: https://github.com/pyodide/pyodide ; CPython sources: https://github.com/python/cpython . Their packaged binaries are unchanged.

## Production tools and narration

Local video generation uses PyMuPDF, Pillow and imageio-ffmpeg as installed tools; they are not redistributed in the website archive. Existing English AndrewMultilingualNeural and Chinese YunxiNeural speech recordings were generated with Microsoft's speech service through edge-tts. Narration is synthetic. No third-party music is included. Service terms are separate from code and text licenses.

## New material

Project-authored implementation code is offered under MIT (see `LICENSE`). New notes and storyboards are offered under CC BY 4.0 with attribution to Xingyu Tan: https://creativecommons.org/licenses/by/4.0/ . This grant excludes third-party code, fonts, supplied source materials, and third-party service rights.

## Voice transport helper

The full local backup retains the ws WebSocket package in vendor/ws for a historical optional narration-generation helper, with its MIT LICENSE. The GitHub source release omits that helper and vendor/ws; neither is loaded by the website.
