import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Mention from '@tiptap/extension-mention';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import HardBreak from '@tiptap/extension-hard-break';
import SlashCommands from './SlashCommands';
import { useAuth } from '../../contexts/AuthContext';

const lowlight = createLowlight(common);

const RichTextEditor = ({ 
  content, 
  initialContent,
  onChange, 
  onUpdate,
  onCursorMove,
  socket,
  pageId,
  editable = true,
  placeholder = 'Start typing or use "/" for commands...',
  isDark = false,
  onEditorReady
}) => {
  const { user } = useAuth();
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
        hardBreak: false, // We'll use HardBreak extension explicitly
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
            'Enter': () => {
              // Regular Enter creates a new paragraph
              return this.editor.commands.splitBlock();
            },
          };
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:text-blue-700',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention px-1 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        },
        suggestion: {
          // Will implement user mention dropdown
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-gray-900 text-gray-100 p-4 my-2',
        },
      }),
    ],
    content: initialContent || content,
    editable,
    autofocus: false,
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onUpdate?.(html);

      // Send content changes via socket
      if (socket && pageId) {
        socket.emit('content-change', {
          pageId,
          content: html,
          cursorPosition: editor.state.selection.anchor,
        });
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      
      // Send cursor position via socket
      if (socket && pageId) {
        try {
          const coords = editor.view.coordsAtPos(from);
          const editorRect = editor.view.dom.getBoundingClientRect();
          
          // Calculate position relative to editor container
          const position = {
            x: coords.left - editorRect.left,
            y: coords.top - editorRect.top,
            from,
            to,
          };

          console.log('📍 Emitting cursor position:', position);
          socket.emit('cursor-move', {
            pageId,
            position,
          });
        } catch (error) {
          // Ignore errors from invalid positions
          console.debug('Cursor position error:', error);
        }
      }

      // Check for slash command
      const { $from } = editor.state.selection;
      const textBefore = $from.nodeBefore?.text || '';
      
      if (textBefore.endsWith('/')) {
        const coords = editor.view.coordsAtPos($from.pos);
        setSlashMenuPosition({ x: coords.left, y: coords.bottom });
        setShowSlashMenu(true);
        setSearchQuery('');
      } else if (textBefore.match(/\/\w*$/)) {
        const match = textBefore.match(/\/(\w*)$/);
        setSearchQuery(match[1]);
      } else {
        setShowSlashMenu(false);
      }
    },
  });

  // Notify parent when editor is ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update editable state when prop changes
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
      console.log('🔧 Editor editable state updated to:', editable);
    }
  }, [editor, editable]);

  // Handle incoming content updates from other users
  useEffect(() => {
    if (!socket || !pageId || !editor) return;

    const handleContentUpdate = ({ userId, content, cursorPosition }) => {
      if (userId !== user?._id) {
        // Update content without losing cursor position
        const currentPos = editor.state.selection.anchor;
        editor.commands.setContent(content, false);
        
        // Try to restore cursor position
        if (currentPos && currentPos <= editor.state.doc.content.size) {
          editor.commands.setTextSelection(currentPos);
        }
      }
    };

    socket.on('content-update', handleContentUpdate);

    return () => {
      socket.off('content-update', handleContentUpdate);
    };
  }, [socket, pageId, editor, user]);

  const handleSlashCommand = useCallback((command) => {
    if (!editor) return;

    // Remove the "/" character
    editor.commands.deleteRange({
      from: editor.state.selection.from - 1,
      to: editor.state.selection.from,
    });

    // Execute command
    switch (command) {
      case 'heading1':
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case 'heading2':
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case 'heading3':
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case 'bulletlist':
        editor.chain().focus().toggleBulletList().run();
        break;
      case 'orderedlist':
        editor.chain().focus().toggleOrderedList().run();
        break;
      case 'todo':
        editor.chain().focus().toggleTaskList().run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'table':
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        break;
      case 'quote':
        editor.chain().focus().toggleBlockquote().run();
        break;
      case 'divider':
        editor.chain().focus().setHorizontalRule().run();
        break;
    }

    setShowSlashMenu(false);
  }, [editor]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="relative w-full h-full overflow-auto">
      <div className={`prose prose-lg max-w-none ${isDark ? 'prose-invert' : ''} p-4 min-h-full`}>
        <EditorContent editor={editor} className="editor-content" />
      </div>

      {showSlashMenu && (
        <SlashCommands
          position={slashMenuPosition}
          searchQuery={searchQuery}
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default RichTextEditor;
