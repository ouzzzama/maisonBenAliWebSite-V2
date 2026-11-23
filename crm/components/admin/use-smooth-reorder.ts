"use client";

import * as React from "react";

/**
 * Anime les cartes entre deux rendus (technique FLIP) : quand un emplacement
 * s'ouvre ou se referme dans une colonne, les cartes glissent à leur nouvelle
 * place au lieu de sauter d'un coup.
 *
 * Les éléments animés portent `data-flip-id` ; la carte en cours de glissement
 * (position fixe) est ignorée, car son transform appartient au glisser-déposer.
 */
export function useSmoothReorder(enabled = true) {
  const previous = React.useRef(new Map<string, DOMRect>());

  React.useLayoutEffect(() => {
    /* pendant un glisser, l'emplacement s'ouvre par les marges : une animation
       FLIP par-dessus ferait sursauter les cartes et brouillerait l'aperçu */
    if (!enabled) {
      previous.current = new Map();
      return;
    }

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-flip-id]"));
    const next = new Map<string, DOMRect>();

    for (const node of nodes) {
      const id = node.dataset.flipId;
      if (!id) continue;
      if (node.style.position === "fixed") continue;

      const rect = node.getBoundingClientRect();
      next.set(id, rect);

      const before = previous.current.get(id);
      if (!before) continue;
      const dx = before.left - rect.left;
      const dy = before.top - rect.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;

      node.style.transition = "none";
      node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      void node.offsetWidth;
      node.style.transition = "transform 200ms cubic-bezier(0.22, 1, 0.36, 1)";
      node.style.transform = "";
    }

    previous.current = next;
  });
}
