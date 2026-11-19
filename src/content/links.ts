import type { Post } from "./content";
export const postParams = (p: Post) => {
  const [, , year, month, day, file] = p.url.split("/");
  return { year: year ?? "", month: month ?? "", day: day ?? "", file: file ?? "" };
};
