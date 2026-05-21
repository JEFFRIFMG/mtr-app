'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface Props {
  /** Array of strings (1 item per bullet/line) */
  value: string[] | null | undefined;
  onChange: (items: string[]) => void;
  placeholder?: string;
  minHeight?: number;
}

/**
 * Rich text editor untuk field multi-item (pros, cons, awards, trust_signals, description, dll).
 * User input pakai Enter / bullet / numbered list.
 * Setiap line/item disimpen sebagai 1 element di array.
 *
 * Storage di Supabase: TEXT[] — sama persis kayak field array existing.
 */
export function RichTextEditor({ value, onChange, placeholder, minHeight = 120 }: Props) {
  // Convert array string ke HTML bullet list
  const initialHTML = arrayToHtml(value);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialHTML,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'mtr-rte-content',
      },
    },
    onUpdate: ({ editor }) => {
      const items = htmlToArray(editor.getHTML());
      onChange(items);
    },
  });

  // Sync external value change (mis. saat broker prop ganti)
  useEffect(() => {
    if (!editor) return;
    const currentItems = htmlToArray(editor.getHTML());
    const incoming = value || [];
    // Skip kalau identik (mencegah cursor reset saat user lagi ngetik)
    if (JSON.stringify(currentItems) === JSON.stringify(incoming)) return;
    editor.commands.setContent(arrayToHtml(value), { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value), editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        background: '#0A1220',
        border: '1px solid #1A2E45',
        borderRadius: '0.375rem',
        overflow: 'hidden',
      }}
    >
      <Toolbar editor={editor} />
      <div
        style={{
          minHeight,
          padding: '0.5rem 0.75rem',
          color: '#E8EDF4',
          fontSize: 14,
        }}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
      <style jsx global>{`
        .mtr-rte-content {
          outline: none;
          min-height: ${minHeight - 16}px;
        }
        .mtr-rte-content ul,
        .mtr-rte-content ol {
          padding-left: 1.5rem;
          margin: 0;
        }
        .mtr-rte-content ul {
          list-style: disc;
        }
        .mtr-rte-content ol {
          list-style: decimal;
        }
        .mtr-rte-content p {
          margin: 0 0 0.25rem 0;
        }
        .mtr-rte-content p:last-child {
          margin-bottom: 0;
        }
        .mtr-rte-content strong {
          color: #00A86B;
        }
        .mtr-rte-content em {
          color: #E8EDF4;
        }
      `}</style>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btnBase: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: '#7A8FA6',
    padding: '0.25rem 0.5rem',
    cursor: 'pointer',
    fontSize: 13,
    borderRadius: 4,
  };

  function btn(active: boolean): React.CSSProperties {
    return {
      ...btnBase,
      color: active ? '#00A86B' : '#7A8FA6',
      background: active ? 'rgba(0, 168, 107, 0.1)' : 'transparent',
    };
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        padding: '0.25rem 0.5rem',
        borderBottom: '1px solid #1A2E45',
        background: '#0F1825',
      }}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        style={btn(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        style={btn(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <div style={{ width: 1, background: '#1A2E45', margin: '0 4px' }} />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={btn(editor.isActive('bulletList'))}
        title="Bullet list"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={btn(editor.isActive('orderedList'))}
        title="Numbered list"
      >
        1. List
      </button>
    </div>
  );
}

// ============================================================
// Converters: array <-> HTML
// ============================================================

/** Convert array string ke HTML bullet list */
function arrayToHtml(items: string[] | null | undefined): string {
  if (!items || items.length === 0) return '<ul><li></li></ul>';
  return '<ul>' + items.map((item) => `<li>${escapeHtml(item)}</li>`).join('') + '</ul>';
}

/** Convert HTML editor ke array string (1 item per <li> atau <p>) */
function htmlToArray(html: string): string[] {
  if (typeof window === 'undefined') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Prioritas: ambil <li> dari list (bullet/numbered)
  const listItems = doc.querySelectorAll('li');
  if (listItems.length > 0) {
    return Array.from(listItems)
      .map((li) => unwrapBlockTags(li.innerHTML).trim())
      .filter((s) => s && s !== '<br>' && stripTags(s).trim().length > 0);
  }

  // Fallback: kalau ga ada list, ambil <p> atau text content
  const paragraphs = doc.querySelectorAll('p');
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map((p) => p.innerHTML.trim())
      .filter((s) => s && s !== '<br>' && stripTags(s).trim().length > 0);
  }

  // Last resort: plain text
  const text = doc.body.textContent?.trim() || '';
  return text ? [text] : [];
}

/**
 * Hapus block-level tag pembungkus (mis. <p>) yang ditambahin Tiptap di dalam <li>.
 * Inline formatting (<strong>, <em>, <a>) di-preserve.
 *
 * Contoh: "<p>Regulated by FCA</p>" → "Regulated by FCA"
 * Contoh: "<p><strong>Top broker</strong></p>" → "<strong>Top broker</strong>"
 */
function unwrapBlockTags(html: string): string {
  return html
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/<\/?div[^>]*>/gi, '')
    .trim();
}

function escapeHtml(str: string): string {
  // Karena content bisa sudah mengandung tag formatting dari user (bold/italic),
  // kita TIDAK escape full — assume input dari editor sendiri sudah safe.
  return str;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
