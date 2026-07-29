/**
 * Render doctor-authored rich text.
 *
 * The HTML is sanitised on the server against a strict allowlist before it is
 * stored, so this is safe. Every place that shows a description must go through
 * here — rendering it as plain text instead leaks literal `<p>` tags onto the
 * page, which is exactly what happened to video and Instagram captions.
 */
export function RichText({
  html,
  className = "",
}: {
  html: string | null | undefined;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={`[&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
