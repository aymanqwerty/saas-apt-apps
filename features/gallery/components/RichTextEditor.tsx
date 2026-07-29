"use client";

import Link from "@tiptap/extension-link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Undo2,
} from "lucide-react";

/**
 * Rich-text editor for the blog body.
 *
 * Emits HTML, which the API sanitises against an allowlist before storing —
 * this component is a convenience, never the security boundary. Its toolbar is
 * deliberately limited to the tags the server actually keeps.
 */
export function RichTextEditor({
  value,
  onChange,
  minHeight = "min-h-40",
}: {
  value: string;
  onChange: (html: string) => void;
  /** Tailwind min-height class — image captions need less room than a body. */
  minHeight?: string;
}) {
  const editor = useEditor({
    // Rendering the editor on the server produces a hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // Not in the server allowlist, so don't offer them.
        codeBlock: false,
        horizontalRule: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      // TipTap represents "empty" as an empty paragraph; normalise it away so
      // an untouched editor doesn't save markup.
      onChange(html === "<p></p>" ? "" : html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none ${minHeight} px-3 py-2 outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_a]:underline`,
      },
    },
  });

  if (!editor) {
    return (
      <div className="border-input text-muted-foreground rounded-lg border px-3 py-2 text-sm">
        Loading editor...
      </div>
    );
  }

  const buttons = [
    {
      icon: Bold,
      label: "Bold",
      isActive: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      isActive: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Heading2,
      label: "Heading",
      isActive: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3,
      label: "Subheading",
      isActive: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: List,
      label: "Bullet list",
      isActive: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      isActive: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: Quote,
      label: "Quote",
      isActive: editor.isActive("blockquote"),
      run: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border-input focus-within:border-ring overflow-hidden rounded-lg border">
      <div className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1">
        {buttons.map(({ icon: Icon, label, isActive, run }) => (
          <button
            key={label}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            onClick={run}
            className={`rounded p-1.5 transition ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
          </button>
        ))}
        <button
          type="button"
          title="Link"
          aria-label="Link"
          onClick={setLink}
          className={`rounded p-1.5 transition ${
            editor.isActive("link")
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Link2 className="size-4" />
        </button>
        <button
          type="button"
          title="Undo"
          aria-label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded p-1.5 transition"
        >
          <Undo2 className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
