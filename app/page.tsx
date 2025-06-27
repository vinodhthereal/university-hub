import Link from 'next/link'
import { Button, Container, Title, Text, Group, Stack } from '@mantine/core'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Container size="lg" className="py-20">
        <Stack align="center" spacing="xl">
          <Title order={1} size="h1" weight={700} align="center" className="text-5xl">
            Welcome to University Hub
          </Title>
          <Text size="xl" color="dimmed" align="center" className="max-w-2xl">
            Your complete campus management solution. Manage registration, attendance, examinations, fees, and more - all in one place.
          </Text>
          <Group mt="xl">
            <Link href="/login">
              <Button size="lg" variant="filled">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="light">
                Register
              </Button>
            </Link>
          </Group>
        </Stack>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-3">For Students</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Access your courses, view attendance, check results, pay fees, and apply for out-passes online.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-3">For Faculty</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Manage attendance, upload marks, view schedules, and communicate with students efficiently.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-semibold mb-3">For Administration</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Complete oversight of all campus operations with detailed analytics and reporting.
            </p>
          </div>
        </div>
      </Container>
    </div>
  )
}