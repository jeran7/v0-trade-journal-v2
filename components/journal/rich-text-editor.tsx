"use client"

import { useEffect, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, LinkIcon, Heading1, Heading2, Code, Quote, Undo, Redo } from "lucide-react"

interface RichTextEditorProps {
  initialContent?: any
  placeholder?: string
  onChange?: (content: any) => void
  className?: string
  readOnly?: boolean
}

// Create a default initial content structure for Tiptap
const defaultContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
}

export function RichTextEditor({
  initialContent,
  placeholder = "Start writing...",
  onChange,
  className,
  readOnly = false,
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Ensure we have a valid initial content
  const validInitialContent =
    initialContent && typeof initialContent === "object" && Object.keys(initialContent).length > 0
      ? initialContent
      : defaultContent

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: validInitialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange?.(json)
    },
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ensure content updates properly when initialContent changes
  useEffect(() => {
    if (editor && initialContent && Object.keys(initialContent).length > 0) {
      // Only update if content changed and is different
      const currentContent = editor.getJSON()
      if (JSON.stringify(currentContent) !== JSON.stringify(initialContent)) {
        editor.commands.setContent(initialContent)
      }
    }
  }, [editor, initialContent])

  if (!isMounted) {
    return null
  }

  if (readOnly) {
    return (
      <div className={cn("prose prose-invert max-w-none", className)}>
        <EditorContent editor={editor} />
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          disabled={!editor?.can().chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          disabled={!editor?.can().chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          disabled={!editor?.can().chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = prompt("Enter link URL:")
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run()
            }
          }}
          disabled={!editor?.can().chain().focus().setLink({ href: "" }).run()}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          disabled={!editor?.can().chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-[300px] rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <EditorContent editor={editor} className="min-h-[300px] prose prose-invert max-w-none" />
      </div>
    </div>
  )
}
