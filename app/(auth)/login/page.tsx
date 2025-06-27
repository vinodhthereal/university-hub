'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TextInput, PasswordInput, Button, Paper, Title, Text, Stack, Group, Divider, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import { IconAlertCircle } from '@tabler/icons-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  })

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) throw error

      if (data.user) {
        notifications.show({
          title: 'Success',
          message: 'Logged in successfully!',
          color: 'green',
        })
        
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during login')
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to login',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper className="w-full max-w-md p-8 rounded-xl shadow-xl">
      <Stack spacing="md">
        <div>
          <Title order={2} align="center" mb={5}>
            Welcome back
          </Title>
          <Text color="dimmed" size="sm" align="center">
            Login to University Hub
          </Text>
        </div>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            {error}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...form.getInputProps('password')}
            />
            
            <Group position="apart" mt="xs">
              <Text size="sm">
                Don't have an account?{' '}
                <Link href="/register" className="text-primary-600 hover:underline">
                  Register
                </Link>
              </Text>
              <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </Group>

            <Button type="submit" fullWidth loading={loading} mt="xl">
              Sign in
            </Button>
          </Stack>
        </form>

        <Divider label="Or continue with" labelPosition="center" my="lg" />

        <Group grow>
          <Button 
            variant="outline" 
            onClick={() => {
              notifications.show({
                message: 'SSO integration coming soon!',
                color: 'blue',
              })
            }}
          >
            University SSO
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}