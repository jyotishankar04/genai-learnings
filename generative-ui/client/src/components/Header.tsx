interface HeaderProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

export function Header({ title, showBackButton = false, onBack }: HeaderProps) {
  return (
    <header className="h-14 flex items-center px-6 sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              className="mr-1 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-primary-foreground"
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

          <div className="leading-tight">
            <h1 className="text-foreground font-semibold text-sm tracking-tight">{title}</h1>
            <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
              AI Powered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-border text-xs text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Online
        </div>
      </div>
    </header>
  )
}
