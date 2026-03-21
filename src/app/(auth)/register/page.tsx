import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary mb-4">
            <span className="text-primary-foreground font-bold text-xl">m</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">miniCRM</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your workspace</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
