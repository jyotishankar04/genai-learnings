import { useRef, useEffect } from "react"

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Add an expense or ask a question...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [value])

  const canSubmit = value.trim().length > 0

  return (
    <div className="px-6 py-4 border-t border-border bg-background">
      <div className="max-w-3xl mx-auto">
        <div className="relative border border-border bg-card has-[:focus]:border-ring/60 transition-colors duration-150">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            style={{ minHeight: "52px", maxHeight: "140px" }}
            className="w-full bg-transparent px-5 py-3.5 pr-14 text-foreground placeholder:text-muted-foreground resize-none outline-none text-sm leading-relaxed overflow-y-auto"
          />

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`absolute right-3 bottom-[11px] w-8 h-8 flex items-center justify-center transition-all duration-150 ${
              canSubmit
                ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95 cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-center text-[11px] mt-2 text-muted-foreground/70">
          AI can make mistakes — please verify important financial data
        </p>
      </div>
    </div>
  )
}
