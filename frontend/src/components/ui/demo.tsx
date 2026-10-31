import { AuthForm } from "@/components/ui/sign-in"

export default function AuthFormDemo() {
  const handleSocialSignIn = (provider: string) => {
    console.log(`Signing in with ${provider}...`)
  }

  const handleEmailSubmit = (data: { email: string; password?: string }) => {
    console.log("Form submitted:", data)
  }

  const handleEmailLink = () => {
    console.log("Requesting email link...")
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#FBF8F3] dark:bg-muted/20">
      <AuthForm 
        onSocialSignIn={handleSocialSignIn}
        onEmailSubmit={handleEmailSubmit}
        onEmailLink={handleEmailLink}
        className="shadow-xl"
      />
    </div>
  )
}
