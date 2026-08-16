# Playwrite Site Font Design

## Scope

Apply the supplied Playwrite DE Grund font to all site typography. The
application will no longer fetch its body or display fonts from Google.

## Assets

- Add `PlaywriteDEGrund-VariableFont_wght.ttf` under `src/app/fonts/`.
- Add the accompanying SIL Open Font License as `src/app/fonts/OFL.txt`.
- Use the variable font's available `100 400` weight range.

## Implementation

`src/app/layout.tsx` will replace the `next/font/google` imports and font
declarations with `next/font/local`. A single local font definition will expose
the existing `--font-body` CSS variable. The same variable will also be
assigned to `--font-display`, preserving the current CSS and Tailwind font
tokens while changing all visible text to Playwrite.

The existing `globals.css` typography rules and component classes stay
unchanged. Styles requesting weights above 400 will be synthesized by the
browser because the supplied typeface does not include heavier source files.

## Verification

Run the affected layout test, then run the complete test suite, lint, and
production build. Confirm the font source is local and that no
`next/font/google` import remains in the application layout.
