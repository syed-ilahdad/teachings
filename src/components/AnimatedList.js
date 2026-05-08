'use client';
import { useEffect, useRef } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

/**
 * Wrap any list/grid in this component and AutoAnimate will
 * automatically animate add/remove/reorder with zero config.
 *
 * Usage:
 *   <AnimatedList className="grid grid-cols-3 gap-4">
 *     {items.map(i => <Card key={i.id} ... />)}
 *   </AnimatedList>
 */
export default function AnimatedList({ children, className = '', style = {} }) {
  const [parent] = useAutoAnimate({ duration: 220, easing: 'ease-out' });
  return (
    <div ref={parent} className={className} style={style}>
      {children}
    </div>
  );
}