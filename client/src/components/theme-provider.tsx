import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = (nextTheme: "light" | "dark") => {
      root.classList.remove("light", "dark")
      root.classList.add(nextTheme)
      root.style.colorScheme = nextTheme
    }

    if (theme === "system") {
      const applySystemTheme = (event?: MediaQueryListEvent) =>
        applyTheme(event?.matches ?? systemTheme.matches ? "dark" : "light")

      applySystemTheme()
      systemTheme.addEventListener("change", applySystemTheme)
      return () => systemTheme.removeEventListener("change", applySystemTheme)
    }

    applyTheme(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
