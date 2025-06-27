'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TextInput, Button, Paper, Title, Text, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import { IconArrowLeft } from '@tabler/icons-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setSuccess(true)
      notifications.show({
        title: 'Success',
        message: 'Password reset link sent to your email!',
        color: 'green',
      })
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to send reset link',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Paper className="w-full max-w-md p-8 rounded-xl shadow-xl">
        <Stack gap="md" align="center">
          <Title order={2}>Check your email</Title>
          <Text color="dimmed" size="sm" ta="center">
            We've sent a password reset link to {form.values.email}
          </Text>
          <Text size="sm" ta="center">
            Didn't receive the email? Check your spam folder or{' '}
            <Text
              component="span"
              color="blue"
              className="cursor-pointer hover:underline"
              onClick={() => setSuccess(false)}
            >
              try again
            </Text>
          </Text>
          <Link href="/login" className="mt-4">
            <Button leftSection={<IconArrowLeft size={16} />} variant="subtle">
              Back to login
            </Button>
          </Link>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper className="w-full max-w-md p-8 rounded-xl shadow-xl">
      <Stack gap="md">
        <div>
          <Title order={2} ta="center" mb={5}>
            Forgot Password?
          </Title>
          <Text color="dimmed" size="sm" ta="center">
            Enter your email and we'll send you a reset link
          </Text>
        </div>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md" mt="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />

            <Button type="submit" fullWidth loading={loading}>
              Send Reset Link
            </Button>

            <Text size="sm" ta="center">
              Remember your password?{' '}
              <Link href="/login" className="text-primary-600 hover:underline">
                Back to login
              </Link>
            </Text>
          </Stack>
        </form>
      </Stack>
    </Paper>
  )
}
