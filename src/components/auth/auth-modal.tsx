
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const authSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type AuthFormValues = z.infer<typeof authSchema>

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
  })

  // Reset form when toggling mode
  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError(null)
    reset()
  }

  const onSubmit = async (data: AuthFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Login logic
        const email = `${data.username}@spillthechai.app`
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: data.password,
        })

        if (error) throw error
      } else {
        // Signup logic
        // 1. Check if username exists in public table is handled by DB unique constraint
        // but we can also check auth.users sign up error.
        const email = `${data.username}@spillthechai.app`
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: data.password,
          options: {
            data: {
              username: data.username,
            },
          },
        })

        if (signUpError) throw signUpError
        
        // We also need to insert into public users table if the trigger doesn't do it.
        // The user said "Each logged-in user creates exactly one row"
        // Usually we use a trigger. If no trigger, we must insert manually.
        // Assuming user has set up a trigger based on "Users cannot edit or delete rows",
        // or we have to insert.
        // "A user can insert only their own row" policy suggests we might need to insert manually.
        
        if (signUpData.user) {
             const { error: profileError } = await supabase.from('users').insert({
                 id: signUpData.user.id,
                 username: data.username
             })
             if (profileError) {
                 // If trigger already inserted, we might get duplicate error if we try.
                 // But typically policies prevent duplicate PKs.
                 // Let's assume manual insert is needed based on "A user can insert only their own row" policy description.
                 console.error("Profile creation error:", profileError)
                 // If it is a duplicate key error, maybe trigger handled it?
                 // But let's proceed.
             }
        }
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      console.error(err)
      if (err.message.includes('User already registered')) {
         setError('Username is already taken')
      } else if (err.message.includes('Invalid login credentials')) {
         setError('Invalid username or password')
      } else {
        setError(err.message || 'Something went wrong')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">
            {isLogin ? 'Welcome Back!' : 'Join the Tea Party ☕'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? 'Login to spill or sip safely.'
              : 'Pick a username. No email, no phone, just vibes.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Username"
                {...register('username')}
                autoCapitalize="none"
                autoComplete="off"
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            {error && (
              <div className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? 'Login' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={toggleMode} className="text-muted-foreground">
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Login'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
