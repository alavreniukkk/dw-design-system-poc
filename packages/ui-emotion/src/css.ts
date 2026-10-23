import { css } from "@emotion/css";

export const focusVisible = css`
  &:focus-visible {
    outline-style: solid;
    outline-width: var(--border-width-focus);
    outline-offset: var(--border-width-focus);
    outline-color: var(--color-border-brand);
  }
`;

export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
`;

export const iconFit = css`
  max-width: none;
  flex-shrink: 0;
`;
