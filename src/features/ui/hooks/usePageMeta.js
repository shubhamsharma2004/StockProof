import { useEffect } from "react";
import { DEFAULT_DESCRIPTION, PAGE_META } from "../lib/pageMeta.js";
import { pathForPage } from "../lib/routes.js";

function setHeadTag(tag, keyAttr, key, valueAttr, value) {
  let el = document.head.querySelector(`${tag}[${keyAttr}="${key}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(valueAttr, value);
}

// Keeps <title>, the description, canonical URL and social tags in step with
// the page on screen. Each page calls it once; `overrides` replaces the
// page's defaults (e.g. a specific stock or IPO).
export function usePageMeta(page, overrides) {
  const defaults = PAGE_META[page] || PAGE_META.dashboard;
  const title = overrides?.title || defaults.title;
  const description = overrides?.description || defaults.description || DEFAULT_DESCRIPTION;
  const path = overrides?.path || pathForPage(page);

  useEffect(() => {
    const url = `${window.location.origin}${path}`;
    document.title = title;
    setHeadTag("meta", "name", "description", "content", description);
    setHeadTag("meta", "property", "og:title", "content", title);
    setHeadTag("meta", "property", "og:description", "content", description);
    setHeadTag("meta", "property", "og:url", "content", url);
    setHeadTag("meta", "name", "twitter:title", "content", title);
    setHeadTag("meta", "name", "twitter:description", "content", description);
    setHeadTag("link", "rel", "canonical", "href", url);
  }, [title, description, path]);
}
