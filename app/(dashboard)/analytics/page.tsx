'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Title,
  Group,
  Select,
  Grid,
  Card,
  Text,
  Stack,
  RingProgress,
  Progress,
  SimpleGrid,
} from '@mantine/core'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { IconUsers, IconTrendingUp, IconSchool, IconCash } from '@tabler/icons-react'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('month')
  const [department, setDepartment] = useState<string | null>(null)

  const attendanceData = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 88 },
    { month: 'Mar', attendance: 82 },
    { month: 'Apr', attendance: 90 },
    { month: 'May', attendance: 87 },
    { month: 'Jun', attendance: 91 },
  ]

  const departmentPerformance = [
    { name: 'Computer Science', students: 240, avgGPA: 8.2, placement: 92 },
    { name: 'Electronics', students: 180, avgGPA: 7.8, placement: 85 },
    { name: 'Mechanical', students: 200, avgGPA: 7.5, placement: 78 },
    { name: 'Civil', students: 150, avgGPA: 7.2, placement: 75 },
  ]

  const feeCollection = [
    { month: 'Jan', collected: 2500000, pending: 500000 },
    { month: 'Feb', collected: 2800000, pending: 400000 },
    { month: 'Mar', collected: 3000000, pending: 300000 },
    { month: 'Apr', collected: 2900000, pending: 350000 },
    { month: 'May', collected: 3200000, pending: 250000 },
    { month: 'Jun', collected: 3400000, pending: 200000 },
  ]

  const gradeDistribution = [
    { grade: 'A+', students: 120, percentage: 15 },
    { grade: 'A', students: 200, percentage: 25 },
    { grade: 'B', students: 280, percentage: 35 },
    { grade: 'C', students: 160, percentage: 20 },
    { grade: 'D', students: 40, percentage: 5 },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Analytics Dashboard</Title>
        <Group>
          <Select
            placeholder="Time Range"
            data={[
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'quarter', label: 'Last Quarter' },
              { value: 'year', label: 'Last Year' },
            ]}
            value={timeRange}
            onChange={(value) => setTimeRange(value || '')}
            style={{ width: 150 }}
          />
          <Select
            placeholder="All Departments"
            data={['Computer Science', 'Electronics', 'Mechanical', 'Civil']}
            value={department}
            onChange={setDepartment}
            clearable
            style={{ width: 200 }}
          />
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Students
                </Text>
                <Text size="xl" fw={700}>
                  1,770
                </Text>
                <Text size="xs" color="green" mt={5}>
                  +12% from last month
                </Text>
              </div>
              <IconUsers size={30} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Avg Attendance
                </Text>
                <Text size="xl" fw={700}>
                  87.2%
                </Text>
                <Text size="xs" color="green" mt={5}>
                  +2.3% from last month
                </Text>
              </div>
              <IconSchool size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Fee Collection
                </Text>
                <Text size="xl" fw={700}>
                  ₹3.4M
                </Text>
                <Text size="xs" color="green" mt={5}>
                  94% collected
                </Text>
              </div>
              <IconCash size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Placement Rate
                </Text>
                <Text size="xl" fw={700}>
                  82.5%
                </Text>
                <Text size="xs" color="green" mt={5}>
                  +5% from last year
                </Text>
              </div>
              <IconTrendingUp size={30} color="violet" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Attendance Trends
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
              Grade Distribution
            </Title>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.grade}: ${entry.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid gutter="lg" mt="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Department Performance
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgGPA" fill="#3b82f6" name="Avg GPA" />
                <Bar dataKey="placement" fill="#10b981" name="Placement %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Fee Collection Analysis
            </Title>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={feeCollection}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="collected" stroke="#10b981" name="Collected" />
                <Line type="monotone" dataKey="pending" stroke="#ef4444" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid gutter="lg" mt="lg">
        <Grid.Col span={{ base: 12 }}>
          <Paper p="lg" radius="md" withBorder>
            <Title order={4} mb="md">
              Department-wise Metrics
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
              {departmentPerformance.map((dept) => (
                <Card key={dept.name} withBorder p="md">
                  <Text size="sm" fw={600} mb="xs">
                    {dept.name}
                  </Text>
                  <Stack gap="xs">
                    <div>
                      <Text size="xs" color="dimmed">
                        Students
                      </Text>
                      <Text size="lg" fw={600}>
                        {dept.students}
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" color="dimmed">
                        Average GPA
                      </Text>
                      <Progress value={dept.avgGPA * 10} color="blue" size="lg" />
                      <Text size="xs" mt={2}>
                        {dept.avgGPA}/10
                      </Text>
                    </div>
                    <div>
                      <Text size="xs" color="dimmed">
                        Placement Rate
                      </Text>
                      <Progress value={dept.placement} color="green" size="lg" />
                      <Text size="xs" mt={2}>
                        {dept.placement}%
                      </Text>
                    </div>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  )
}
