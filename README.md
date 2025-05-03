# TypingFX <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 40px"/>

[![test](https://github.com/react18-tools/typingfx/actions/workflows/test.yml/badge.svg)](https://github.com/react18-tools/typingfx/actions/workflows/test.yml) [![Maintainability](https://api.codeclimate.com/v1/badges/aa896ec14c570f3bb274/maintainability)](https://codeclimate.com/github/react18-tools/typingfx/maintainability) [![codecov](https://codecov.io/gh/react18-tools/typingfx/graph/badge.svg)](https://codecov.io/gh/react18-tools/typingfx) [![Version](https://img.shields.io/npm/v/typingfx.svg?colorB=green)](https://www.npmjs.com/package/typingfx) [![Downloads](https://img.jsdelivr.com/img.shields.io/npm/d18m/typingfx.svg)](https://www.npmjs.com/package/typingfx) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/typingfx) [![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/from-referrer/)

> **⚡ Customizable, smooth, and snappy typing animations for React**  
> Animate your text like a pro — fully compatible with React 18/19, Next.js 14/15, and React Server Components.

---

## ✨ Features

- 🎯 Built for modern React (18/19) and Next.js (14/15)
- ✨ Smooth, realistic word-by-word animation
- 🔁 Step-based sequences with infinite looping
- 💅 JSX-ready — animate styled, rich text effortlessly
- 🧠 Honors `prefers-reduced-motion` accessibility setting
- ⚡ Hybrid CSS + JS for best performance
- 💡 Fully typed with TypeScript
- 🧩 SSR-safe and RSC-compatible
- 🚫 No runtime dependencies

---

## 🚀 Install

```bash
pnpm add typingfx
```

**_or_**

```bash
npm install typingfx
```

**_or_**

```bash
yarn add typingfx
```

---

## 🔧 Usage

### ① Import Styles

> 🎨 Required for typing animation and cursor styling.

**In JSX (Next.js layout files recommended):**

```tsx
import "typingfx/dist/index.css";
```

**Or in global CSS:**

```css
@import "typingfx/dist/index.css";
```

---

### ② Basic Typing Animation

```tsx
import { TypeOut } from "typingfx";

export default function Example() {
  return (
    <TypeOut
      steps={["Frontend Developer.", "React Enthusiast.", "Open Source Advocate."]}
      speed={25}
      delSpeed={40}
      repeat={Infinity}
    />
  );
}
```

---

### ③ Single-Step Typing

Need a one-off typing effect without using `steps`?

```tsx
export default function Example() {
  return (
    <TypeOut>
      I love {500} <strong>typingfx</strong>
    </TypeOut>
  );
}
```

> ⏱️ Use numbers inside JSX to insert pauses (in milliseconds) during typing.  
> ➖ Negative numbers delay deletion.  
> 🔤 Want to render the number instead? Wrap it with `String()` or use template literals.

---

### ④ Animate JSX & Rich Text

```tsx
<TypeOut
  steps={[
    <>
      Building with <strong>React</strong>
    </>,
    <>
      Deploying on <code>Vercel</code>
    </>,
    <>
      Coding like a <span className="emoji">💻</span>
    </>,
  ]}
  speed={30}
  repeat={3}
/>
```

Thanks for the clarification — that makes the distinction much clearer. Here’s the revised **Component Animation (Beta)** section for your README, integrating all key details:

## ✨ Component Animation (Beta)

TypingFX now supports component-level animation in **beta**.

### 🔧 Default Behavior: Typing Through Pure Components

By default, TypingFX attempts to "type" the component content **as if it were inline JSX**. This works best when your component is **pure** (no side effects or internal state), allowing TypingFX to extract and animate the raw JSX output.

```tsx
<Component /> → JSX → animated like regular content
```

This enables smooth, character-by-character typing that matches the surrounding text.

### 🛠 Custom Animation with `componentAnimation`

For non-pure components (e.g., those with side effects or dynamic behavior), you can opt out of JSX extraction by providing a `componentAnimation` prop:

```ts
componentAnimation?: {
  wrapper: React.ElementType;
  props?: Record<string, any>;
};
```

In this mode, we skip the JSX extraction and **wrap the component directly** inside a fading animation container:

- Fade-in (`fadein`, 5s) for typing
- Fade-out (`fadeout`, 3s) for deletion

```scss
.component {
  position: relative;
  text-wrap: nowrap;
  overflow: hidden;

  &.type {
    height: auto !important;
    animation: fadein 5s;
  }

  &.del {
    animation: fadeout 3s;
  }
}
```

This approach is safer for components with internal logic, effects, or asynchronous rendering.

### 🎨 CSS Overrides

To fully customize the animations, override these CSS classes:

```css
.tfx_component.tfx_type {
  animation: myCustomFadeIn 2s ease-in;
}

.tfx_component.tfx_del {
  animation: myCustomFadeOut 2s ease-out;
}
```

### 💬 API Feedback Welcome

We're exploring the best API design for component animation. If you have ideas or requirements, please open an [issue or discussion](https://github.com/react18-tools/typingfx/issues).

---

## 💡 Tips & Tricks

### ⏱️ Delays & Pauses with Numbers

You can embed numbers (e.g. `{1000}`) directly inside JSX (`steps` **or** `children`) to add typing or deleting delays:

```tsx
<TypeOut
  steps={[
    <>
      Hello{800}
      {-500}
    </>,
    "World!",
  ]}
/>
```

- `{800}` → pauses for 800ms while typing
- `{-500}` → pauses for 500ms while deleting

> ⚠️ **Important**: Numbers must be embedded directly as JSX expressions — not as strings.

If you want to display a number instead of pausing, convert it to a string:

```tsx
<>I waited {String(800)} milliseconds.</>
```

---

### ⚠️ Memoization Matters

To prevent unintended animation restarts on re-renders, **memoize** your `steps` or `children` using `useMemo`:

```tsx
const steps = useMemo(() => ["One", "Two", "Three"], []);
<TypeOut steps={steps} />;
```

This is especially useful in dynamic React apps or when props change frequently.

---

### 🧱 Multi-Line Typing Support

Each step can contain **multiple elements** like `<p>`, `<div>`, or fragments – `typingfx` will animate them line by line:

```tsx
<TypeOut
  steps={[
    <>
      <p>Hi there</p>
      <p>Welcome to TypingFX!</p>
    </>,
    <>
      <p>Hi there</p>
      <p>TypingFX is awesome!</p>
    </>,
  ]}
/>
```

> ✅ No need to split them into separate steps – group them as one step to animate fluidly across lines.

---

### 🚫 Avoid Layout Shifts on Delays

When inserting delays between block elements, prefer placing the delay **inside one block**, rather than between them:

```tsx
// ❌ Avoid: causes extra spacing
<>
  <p>Hi</p>
  {5000}
  <p>Hello</p>
</>

// ✅ Recommended
<>
  <p>Hi{5000}</p>
  <p>Hello</p>
</>
// or
<>
  <p>Hi</p>
  <p>{5000}Hello</p>
</>
```

---

### ✨ Control the Cursor

Want to hide the blinking cursor?

```tsx
<TypeOut noCursor>Hello, no cursor here!</TypeOut>
```

---

### 🌐 Seamless RSC & Next.js Support

No extra setup needed – `TypeOut` is already marked as a client component.

> ✅ Works out of the box with Next.js 14/15 and React Server Components (RSC).

---

## ⚙️ Props

| Prop       | Type           | Default    | Description                                                |
| ---------- | -------------- | ---------- | ---------------------------------------------------------- |
| `steps`    | `ReactNode[]`  | `[""]`     | The sequence of text or elements to animate.               |
| `speed`    | `number`       | `20`       | Typing speed (characters per second).                      |
| `delSpeed` | `number`       | `40`       | Deletion speed (characters per second).                    |
| `repeat`   | `number`       | `Infinity` | Number of times to loop over steps.                        |
| `noCursor` | `boolean`      | `false`    | Disables the blinking cursor.                              |
| `paused`   | `boolean`      | `false`    | Manually pause or resume animation.                        |
| `force`    | `boolean`      | `false`    | Forces animation even when `prefers-reduced-motion` is on. |
| `children` | `ReactNode`    | `""`       | An optional initial step to animate.                       |
| ...        | `HTMLDivProps` | —          | Additional props are passed to the container element.      |

---

## 📦 Framework Compatibility

- ✅ React 16.8 — React 19
- ✅ Next.js 12 — Next.js 15
- ✅ SSR-safe (no `window` access during render)
- ✅ RSC-compatible (used as a client component)

---

## ❓ FAQ & Gotchas

<details>
<summary>⚠️ <strong>Why does the animation restart on every re-render?</strong></summary>

This usually happens when `steps` or `children` are _not memoized_, causing a new reference on every render.

✅ **Fix:** Use `useMemo` to ensure stable references:

```tsx
const steps = useMemo(() => ["Hello", "World"], []);
<TypeOut steps={steps} />;
```

</details>

---

<details>
<summary>📏 <strong>Why is there extra space when adding delays between elements?</strong></summary>

Inserting a delay like `{500}` **between block elements** (e.g. `<p>`) creates empty text nodes, leading to layout shifts.

❌ Bad:

```tsx
<>
  <p>Hi</p>
  {500}
  <p>Hello</p>
</>
```

✅ Good:

```tsx
<>
  <p>Hi{500}</p>
  <p>Hello</p>
</>
```

> 📌 **Tip:** Always place delays _inside_ a block to avoid glitches.

</details>

---

<details>
<summary>🧩 <strong>Does it work with RSC & Next.js 14/15?</strong></summary>

Absolutely. `TypeOut` is already marked as a **client component**, so it works out of the box with:

- ✅ React Server Components (RSC)
- ✅ App Router
- ✅ Server-side Rendering (SSR)
</details>

---

<details>
<summary>⏪ <strong>How do I add delay during deleting?</strong></summary>

Use **negative numbers** like `{-500}` anywhere in the content.

- `{800}` → pause for 800ms while typing
- `{-500}` → pause for 500ms while deleting

```tsx
<TypeOut steps={["Start typing...", -1000, "Deleting now..."]} />
```

or

```tsx
<TypeOut>Wait before deleting me{-500}</TypeOut>
```

</details>

---

<details>
<summary>🎨 <strong>How do I animate styled or rich text?</strong></summary>

TypingFX supports JSX out of the box! You can mix `<strong>`, `<code>`, emojis, or even full components.

```tsx
<TypeOut
  steps={[
    <>
      Writing with <strong>style</strong>
    </>,
    <>
      Deployed via <code>Vercel</code>
    </>,
    <>💻 Happy Coding!</>,
  ]}
/>
```

> ✨ Fully supports React elements, fragments, and inline styles.

</details>

---

## 📁 License

MPL-2.0 open-source license © [Mayank Chaudhari](https://github.com/mayank1513)

> <img src="https://raw.githubusercontent.com/mayank1513/mayank1513/main/popper.png" style="height: 20px"/> Please enroll in [our courses](https://mayank-chaudhari.vercel.app/courses) or [sponsor](https://github.com/sponsors/mayank1513) our work.

<hr />

<p align="center" style="text-align:center">with 💖 by <a href="https://mayank-chaudhari.vercel.app" target="_blank">Mayank Kumar Chaudhari</a></p>
