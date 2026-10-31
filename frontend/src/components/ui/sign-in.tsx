import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, Mail, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"

// Simple brand icons for social providers
const GoogleIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://cdn.21st.dev/assets/mirror/a6/a60266dab17c1c00981c7077fa025aa84c92782e0657ca2f78b7f70cbb8d5a56.svg"
    alt="Google"
    className="size-4"
    {...props}
  />
)

const MicrosoftIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://cdn.21st.dev/assets/mirror/72/726aa11548b3771591ccbd747f744fbc8acc6879594c14edc740f2c0a00f016b.svg"
    alt="Microsoft"
    className="size-4"
    {...props}
  />
)

const AppleIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
  let isDark = true
  try {
    const { theme } = useTheme()
    isDark = theme === "dark" || theme === undefined
  } catch {
    isDark = true
  }

  return (
    <img
      src={`https://svgl.app/library/apple${isDark ? "_dark" : ""}.svg`}
      alt="Apple"
      className="size-5"
      {...props}
    />
  )
}

export interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onEmailSubmit?: (data: { email: string; password?: string }) => void
  onSocialSignIn?: (provider: "google" | "microsoft" | "apple" | "sso") => void
  onEmailLink?: () => void
  defaultEmail?: string
  defaultPassword?: string
  isLoading?: boolean
  error?: string
}

const AuthForm = React.forwardRef<HTMLDivElement, AuthFormProps>(
  (
    {
      className,
      onEmailSubmit,
      onSocialSignIn,
      onEmailLink,
      defaultEmail = "admin@retailvision.com",
      defaultPassword = "admin123",
      isLoading = false,
      error,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [email, setEmail] = React.useState(defaultEmail)
    const [password, setPassword] = React.useState(defaultPassword)

    React.useEffect(() => {
      setEmail(defaultEmail)
    }, [defaultEmail])

    React.useEffect(() => {
      setPassword(defaultPassword)
    }, [defaultPassword])

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      onEmailSubmit?.({ email, password })
    }

    return (
      <Card ref={ref} className={cn("w-full max-w-md mx-auto shadow-2xl", className)} {...props}>
        <CardHeader className="text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Sign in with email</CardTitle>
          <CardDescription>
            Unlock the storefront to explore the 3D retail simulation marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Social Sign-in */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sign in with</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" type="button" onClick={() => onSocialSignIn?.("google")}>
                  <GoogleIcon />
                </Button>
                <Button variant="outline" type="button" onClick={() => onSocialSignIn?.("microsoft")}>
                  <MicrosoftIcon />
                </Button>
                <Button variant="outline" type="button" onClick={() => onSocialSignIn?.("apple")}>
                  <AppleIcon />
                </Button>
                <Button variant="outline" type="button" onClick={() => onSocialSignIn?.("sso")}>
                  <KeyRound className="h-4 w-4" />
                  <span className="ml-1.5 text-xs font-semibold">SSO</span>
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@retailvision.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@retailvision.com")
                      setPassword("admin123")
                    }}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Use Demo Account
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In & Enter Marketplace"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-4">
          <Button
            variant="ghost"
            type="button"
            className="w-full text-muted-foreground"
            onClick={() => onEmailLink?.()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Or email me a magic link
          </Button>
          <p className="text-xs text-muted-foreground text-center w-full">
            By logging in, you agree to our{" "}
            <a href="#" className="underline hover:text-primary">
              Terms of Service
            </a>{" "}
            &amp;{" "}
            <a href="#" className="underline hover:text-primary">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    )
  }
)
AuthForm.displayName = "AuthForm"

export { AuthForm }
