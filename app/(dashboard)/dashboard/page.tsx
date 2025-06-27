'use client'

import { useEffect, useState } from 'react'
import {
  Grid,
  Card,
  Text,
  Title,
  Group,
  RingProgress,
  SimpleGrid,
  Paper,
  Stack,
  Badge,
} from '@mantine/core'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import {
  IconUsers,
  IconSchool,
  IconCash,
  IconClipboardCheck,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react'

const mockAttendanceData = [
  { date: 'Mon', attendance: 85 },
  { date: 'Tue', attendance: 88 },
  { date: 'Wed', attendance: 82 },
  { date: 'Thu', attendance: 90 },
  { date: 'Fri', attendance: 87 },
  { date: 'Sat', attendance: 75 },
]

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    pendingFees: 0,
    averageAttendance: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch user details
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (userData) {
          setUser({ ...user, ...userData })
        }
      }
    }

    fetchData()
  }, [supabase])

  const statCards = [
    {
      title: 'Total Students',
      value: '1,234',
      icon: IconUsers,
      color: 'blue',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Faculty',
      value: '89',
      icon: IconSchool,
      color: 'green',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Pending Fees',
      value: '₹2.4L',
      icon: IconCash,
      color: 'red',
      trend: '-8%',
      trendUp: false,
    },
    {
      title: 'Avg Attendance',
      value: '85.3%',
      icon: IconClipboardCheck,
      color: 'yellow',
      trend: '+2%',
      trendUp: true,
    },
  ]

  return (
    <div>
      <Title order={2} mb="xl">
        Welcome back, {user?.full_name || user?.email || 'User'}!
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trendUp ? IconTrendingUp : IconTrendingDown

          return (
            <Card key={stat.title} padding="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Icon size={28} color={`var(--mantine-color-${stat.color}-6)`} />
                <Badge color={stat.trendUp ? 'green' : 'red'} variant="light">
                  <Group gap={4}>
                    <TrendIcon size={14} />
                    {stat.trend}
                  </Group>
                </Badge>
              </Group>
              <Text size="xs" color="dimmed" tt="uppercase" fw={700}>
                {stat.title}
              </Text>
              <Text size="xl" fw={700} mt="xs">
                {stat.value}
              </Text>
            </Card>
          )
        })}
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Weekly Attendance Overview
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="lg" radius="md" withBorder h="100%">
            <Title order={4} mb="md">
              Quick Stats
            </Title>
            <Stack>
              <div>
                <Text size="sm" color="dimmed">
                  Active Courses
                </Text>
                <Text size="lg" fw={600}>
                  24
                </Text>
              </div>
              <div>
                <Text size="sm" color="dimmed">
                  Pending Out-passes
                </Text>
                <Text size="lg" fw={600}>
                  7
                </Text>
              </div>
              <div>
                <Text size="sm" color="dimmed">
                  Library Books Issued
                </Text>
                <Text size="lg" fw={600}>
                  156
                </Text>
              </div>
              <div>
                <Text size="sm" color="dimmed">
                  Upcoming Exams
                </Text>
                <Text size="lg" fw={600}>
                  3
                </Text>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid gutter="lg" mt="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Recent Activities
            </Title>
            <Stack gap="sm">
              <Group justify="space-between" className="py-2 border-b">
                <Text size="sm">New student registration</Text>
                <Text size="xs" color="dimmed">
                  2 hours ago
                </Text>
              </Group>
              <Group justify="space-between" className="py-2 border-b">
                <Text size="sm">Fee payment received</Text>
                <Text size="xs" color="dimmed">
                  3 hours ago
                </Text>
              </Group>
              <Group justify="space-between" className="py-2 border-b">
                <Text size="sm">Out-pass approved</Text>
                <Text size="xs" color="dimmed">
                  5 hours ago
                </Text>
              </Group>
              <Group justify="space-between" className="py-2">
                <Text size="sm">Exam results published</Text>
                <Text size="xs" color="dimmed">
                  1 day ago
                </Text>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Department Performance
            </Title>
            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Computer Science</Text>
                  <Text size="sm" fw={600}>
                    92%
                  </Text>
                </Group>
                <RingProgress size={24} thickness={4} sections={[{ value: 92, color: 'green' }]} />
              </div>
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Electronics</Text>
                  <Text size="sm" fw={600}>
                    87%
                  </Text>
                </Group>
                <RingProgress size={24} thickness={4} sections={[{ value: 87, color: 'blue' }]} />
              </div>
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Mechanical</Text>
                  <Text size="sm" fw={600}>
                    79%
                  </Text>
                </Group>
                <RingProgress size={24} thickness={4} sections={[{ value: 79, color: 'yellow' }]} />
              </div>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  )
}
