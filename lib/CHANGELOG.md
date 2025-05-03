# typingfx

## 1.1.0

### Minor Changes

- 636a8d8: Shorten classNames
- d0bf593: Support applygin typing animations to JSX including custom React Components (Limited to only Pure components).

### Patch Changes

- 3293066: Add exports
- e3d4a7e: Cutomize components animations

## 1.0.0

### Major Changes

- eb0bd92: Use children as last step - this is more intuitive. When animation stops (in case of repeat < Infinity), children, if truthy, will be seen rendered.

### Minor Changes

- 704bd9b: Add option to control cursor visibility after compliting the type animation

### Patch Changes

- bf52379: fix: Handle cursor not shown after anim end when it ends with a number (a delay indicator).
- 378bbdc: refactor: split utils in separate file. Export right prop types.
- 9aab8c8: Fix step and children updates.
- 1771179: Handle edge cases
- b862fb0: Export utils for better test coverage as animationed is not supported in vitest env.

## 0.0.1

### Patch Changes

- e6a388a: Fix niggles and optimize
- 8f880e6: Fix repeat
- 189c834: Add ability to pause via pause prop, fix jsx handling
- 3fc6417: Support custom speed per element, enhancements
- 8130e18: Add following features

  - Pause animation when window/tab is hidden
  - do not animate when prefer-reduced-motion is set or repeat is 0 or negative

- f716360: fix cursor
- e4ea401: Fix: prevent layout shifts
