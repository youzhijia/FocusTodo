import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('motion/react', () => {
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial,
      animate,
      exit,
      transition,
      layout,
      layoutId,
      whileTap,
      whileHover,
      whileInView,
      viewport,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      ...rest
    } = props;

    void initial;
    void animate;
    void exit;
    void transition;
    void layout;
    void layoutId;
    void whileTap;
    void whileHover;
    void whileInView;
    void viewport;
    void drag;
    void dragConstraints;
    void dragElastic;
    void dragMomentum;

    return rest;
  };

  const motion = new Proxy(
    {},
    {
      get: (_, element: string) => {
        return React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
          const clean = stripMotionProps(props);
          return React.createElement(element, { ...clean, ref }, clean.children);
        });
      },
    },
  );

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});
