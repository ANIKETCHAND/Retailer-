import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, KeyRound, Mail, Sparkles } from "lucide-react"

// Simple brand icons for social providers
const GoogleIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" {...(props as any)}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
)

const MicrosoftIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="https://cdn.21st.dev/assets/mirror/72/726aa11548b3771591ccbd747f744fbc8acc6879594c14edc740f2c0a00f016b.svg"
    alt="Microsoft"
    className="size-4"
    {...props}
  />
)

const AppleIcon = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170" {...(props as any)}>
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.64-14.01-6.1-9.46-10.88-20.08-14.34-31.86-3.46-11.77-5.19-22.85-5.19-33.22 0-14.13 3.58-25.77 10.74-34.93 7.16-9.16 16.14-13.82 26.94-13.98 5.37.13 11.23 1.48 17.58 4.05 6.35 2.57 10.15 3.93 11.39 4.08 1.85-.27 5.92-1.74 12.21-4.42 6.29-2.68 11.78-3.9 16.48-3.67 15.65.92 27.56 6.84 35.73 17.76-13.9 8.44-20.67 19.8-20.31 34.09.36 11.23 4.67 20.67 12.93 28.32 4.14 3.86 8.87 6.75 14.19 8.67-2.92 8.64-6.49 16.94-10.72 24.91zM119.22 33.02c0-7.39 2.66-14.42 7.98-21.09 5.32-6.67 11.89-10.98 19.72-12.93.92 8.04-1.39 15.42-6.93 22.14-5.54 6.72-12.45 11.02-20.77 12.9-.66-.34-.99-.34-.99-1.02z"/>
  </svg>
)

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
      <Card ref={ref} className={cn("w-full max-w-md mx-auto shadow-2xl border-slate-800 bg-slate-900/95 text-slate-100", className)} {...props}>
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Sign in to RetailVision</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Unlock the storefront and enter the 3D retail metropolis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* PROMINENT GOOGLE SIGN IN BUTTON */}
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => onSocialSignIn?.("google")}
              className="w-full h-11 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold border border-slate-300 shadow-lg shadow-black/20 transition-all active:scale-[0.98] cursor-pointer rounded-xl"
            >
              <GoogleIcon />
              <span className="text-sm font-bold">Sign in with Google</span>
            </Button>

            {/* Other Secondary Social Providers */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => onSocialSignIn?.("microsoft")}
                className="h-8 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              >
                <MicrosoftIcon className="w-3.5 h-3.5" />
                <span>Microsoft</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => onSocialSignIn?.("apple")}
                className="h-8 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              >
                <AppleIcon />
                <span>Apple</span>
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading}
                onClick={() => onSocialSignIn?.("sso")}
                className="h-8 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white"
              >
                <KeyRound className="h-3.5 w-3.5" />
                <span>SSO</span>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-slate-900 px-2 text-slate-400">or sign in with password</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-destructive/15 border border-destructive/30 text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs text-slate-300 font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@retailvision.com"
                    className="pl-9 bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs text-slate-300 font-semibold">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@retailvision.com")
                      setPassword("admin123")
                    }}
                    className="text-[11px] font-semibold text-sky-400 hover:underline cursor-pointer"
                  >
                    Fill Demo Account
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-10 font-mono bg-slate-950 border-slate-700 text-white rounded-xl text-xs"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full font-bold text-xs h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In & Enter Marketplace"}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2 pt-0 pb-4">
          <Button
            variant="ghost"
            type="button"
            className="w-full text-slate-400 hover:text-white text-xs"
            onClick={() => onEmailLink?.()}
          >
            <Sparkles className="mr-2 h-3.5 w-3.5 text-amber-400" />
            Or email me a magic sign-in link
          </Button>
          <p className="text-[10px] text-slate-500 text-center w-full">
            By signing in, you agree to our Terms &amp; Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    )
  }
)
AuthForm.displayName = "AuthForm"

export { AuthForm }
