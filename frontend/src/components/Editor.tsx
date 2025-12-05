'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
}

export default function Editor({ content, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border border-white/10 rounded-lg bg-white/5">
            {/* Toolbar */}
            <div className="border-b border-white/10 p-2 flex flex-wrap gap-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('bold')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('italic')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('strike')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Strike
                </button>
                <div className="w-px bg-white/20" />
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 })
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 })
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 3 })
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    H3
                </button>
                <div className="w-px bg-white/20" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('bulletList')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Bullet List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('orderedList')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Numbered List
                </button>
                <div className="w-px bg-white/20" />
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('blockquote')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Quote
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('codeBlock')
                            ? 'bg-cyan-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                    type="button"
                >
                    Code Block
                </button>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
        </div>
    );
}
