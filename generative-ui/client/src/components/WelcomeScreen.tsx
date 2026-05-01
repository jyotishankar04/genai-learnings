export interface SuggestionPrompt {
  id: string
  text: string
  icon?: string
  description?: string
}

interface WelcomeScreenProps {
  appName: string
  appDescription: string
  suggestions: SuggestionPrompt[]
  onSuggestionClick: (text: string) => void
}

function SuggestionIcon({ name }: { name: string }) {
  switch (name) {
    case "pencil":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    case "list":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      )
    case "target":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 100 12 6 6 0 000-12zm0 4a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      )
    case "chart":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    default:
      return null
  }
}

export function WelcomeScreen({ appDescription, suggestions, onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
      <div className="w-full max-w-xl fade-up">

        <div className="flex justify-center mb-7">
          <div className="w-14 h-14 bg-primary flex items-center justify-center">
            <svg
              className="w-7 h-7 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            {appDescription}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSuggestionClick(s.text)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="fade-up text-left px-4 py-4 border border-border bg-card hover:bg-muted/60 hover:border-foreground/20 transition-colors group"
            >
              {s.icon && (
                <div className="mb-2.5 text-muted-foreground group-hover:text-foreground transition-colors">
                  <SuggestionIcon name={s.icon} />
                </div>
              )}
              <p className="text-foreground text-sm font-medium leading-snug">
                {s.text}
              </p>
              {s.description && (
                <p className="text-muted-foreground text-xs mt-0.5">
                  {s.description}
                </p>
              )}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
