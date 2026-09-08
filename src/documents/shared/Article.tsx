import type { ComponentChildren } from "preact";

interface ArticleProps {
  number: number;
  title: string;
  children?: ComponentChildren;
}

export function Article({ number, title, children }: ArticleProps) {
  return (
    <>
      <h2 class="article-header">
        Article {number}: {title}
      </h2>
      {"\n"}
      {children}
    </>
  );
}
