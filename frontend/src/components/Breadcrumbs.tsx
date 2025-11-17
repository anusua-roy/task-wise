import React from "react";
import { Link } from "react-router-dom";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-muted mb-3" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((it, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center">
              {!isLast && it.href ? (
                <Link to={it.href} className="hover:underline text-sm">
                  {it.label}
                </Link>
              ) : (
                <span className={isLast ? "text-fg font-medium" : "text-muted"}>
                  {it.label}
                </span>
              )}
              {!isLast && <span className="mx-2 text-muted">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
