import { ipoSlug } from "../../ui/index.js";
import { useGetIposQuery } from "../api/ipoApi.js";

// Finds an IPO from its URL slug. The slug doesn't say which list it's in,
// so all four are searched — each is the same cached request the tabs make.
export function useIpoBySlug(slug) {
  const skip = !slug;
  const lists = [
    useGetIposQuery("open", { skip }),
    useGetIposQuery("upcoming", { skip }),
    useGetIposQuery("closed", { skip }),
    useGetIposQuery("listed", { skip }),
  ];
  const ipo = slug ? lists.flatMap((l) => l.data?.ipos || []).find((i) => ipoSlug(i) === slug) || null : null;
  const settled = lists.every((l) => l.isSuccess || l.isError);
  return { ipo, notFound: Boolean(slug) && !ipo && settled };
}
