'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Title,
  Group,
  Select,
  Button,
  Table,
  Badge,
  Checkbox,
  TextInput,
  ActionIcon,
  Text,
  Grid,
  Card,
  RingProgress,
  Stack,
  Tabs,
  Avatar,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconDownload,
  IconCheck,
  IconX,
  IconClock,
  IconCalendar,
} from '@tabler/icons-react'

interface AttendanceRecord {
  id: string
  student_id: string
  student_name: string
  roll_number: string
  status: 'present' | 'absent' | 'late' | 'excused'
}

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    if (selectedCourse && selectedSubject && selectedDate) {
      fetchAttendance()
    }
  }, [selectedCourse, selectedSubject, selectedDate])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          student_id: 'STU001',
          student_name: 'John Doe',
          roll_number: '001',
          status: 'present',
        },
        {
          id: '2',
          student_id: 'STU002',
          student_name: 'Jane Smith',
          roll_number: '002',
          status: 'present',
        },
        {
          id: '3',
          student_id: 'STU003',
          student_name: 'Mike Johnson',
          roll_number: '003',
          status: 'absent',
        },
        {
          id: '4',
          student_id: 'STU004',
          student_name: 'Sarah Williams',
          roll_number: '004',
          status: 'late',
        },
        {
          id: '5',
          student_id: 'STU005',
          student_name: 'David Brown',
          roll_number: '005',
          status: 'present',
        },
      ]
      
      setAttendanceRecords(mockRecords)
      calculateStats(mockRecords)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch attendance records',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records: AttendanceRecord[]) => {
    const stats = records.reduce(
      (acc, record) => {
        acc[record.status]++
        acc.total++
        return acc
      },
      { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
    )
    setStats(stats)
  }

  const updateAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceRecords((prev) =>
      prev.map((record) =>
        record.student_id === studentId ? { ...record, status } : record
      )
    )
    
    const updatedRecords = attendanceRecords.map((record) =>
      record.student_id === studentId ? { ...record, status } : record
    )
    calculateStats(updatedRecords)
  }

  const markAllPresent = () => {
    const updatedRecords = attendanceRecords.map((record) => ({
      ...record,
      status: 'present' as const,
    }))
    setAttendanceRecords(updatedRecords)
    calculateStats(updatedRecords)
  }

  const saveAttendance = async () => {
    try {
      // Save attendance logic here
      notifications.show({
        title: 'Success',
        message: 'Attendance saved successfully',
        color: 'green',
      })
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save attendance',
        color: 'red',
      })
    }
  }

  const filteredRecords = attendanceRecords.filter((record) =>
    record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.roll_number.includes(searchQuery)
  )

  const attendancePercentage = stats.total > 0
    ? Math.round(((stats.present + stats.late) / stats.total) * 100)
    : 0

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Attendance Management</Title>
        <Button leftSection={<IconDownload size={16} />} variant="light">
          Export Report
        </Button>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Select
            label="Select Course"
            placeholder="Choose a course"
            data={[
              'B.Tech Computer Science',
              'B.Tech Electronics',
              'B.Tech Mechanical',
              'B.Tech Civil',
            ]}
            value={selectedCourse}
            onChange={setSelectedCourse}
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Select
            label="Select Subject"
            placeholder="Choose a subject"
            data={[
              'Data Structures',
              'Algorithms',
              'Database Systems',
              'Operating Systems',
            ]}
            value={selectedSubject}
            onChange={setSelectedSubject}
            required
            disabled={!selectedCourse}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <DatePickerInput
            label="Select Date"
            placeholder="Pick a date"
            value={selectedDate}
            onChange={setSelectedDate}
            leftSection={<IconCalendar size={16} />}
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Select
            label="Session Type"
            placeholder="Choose session"
            data={['Theory', 'Practical', 'Tutorial']}
            defaultValue="Theory"
          />
        </Grid.Col>
      </Grid>

      {selectedCourse && selectedSubject && selectedDate && (
        <>
          <Grid gutter="lg" mb="xl">
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md">
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Present
                </Text>
                <Group justify="space-between" mt="xs">
                  <Text size="xl" fw={700} color="green">
                    {stats.present}
                  </Text>
                  <IconCheck size={24} color="green" />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md">
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Absent
                </Text>
                <Group justify="space-between" mt="xs">
                  <Text size="xl" fw={700} color="red">
                    {stats.absent}
                  </Text>
                  <IconX size={24} color="red" />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md">
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Late
                </Text>
                <Group justify="space-between" mt="xs">
                  <Text size="xl" fw={700} color="yellow">
                    {stats.late}
                  </Text>
                  <IconClock size={24} color="orange" />
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                      Attendance
                    </Text>
                    <Text size="xl" fw={700}>
                      {attendancePercentage}%
                    </Text>
                  </div>
                  <RingProgress
                    size={60}
                    thickness={6}
                    sections={[
                      { value: attendancePercentage, color: 'green' },
                      { value: 100 - attendancePercentage, color: 'gray' },
                    ]}
                  />
                </Group>
              </Card>
            </Grid.Col>
          </Grid>

          <Paper withBorder p="md">
            <Group justify="space-between" mb="md">
              <TextInput
                placeholder="Search by name or roll number"
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                style={{ width: 300 }}
              />
              <Group>
                <Button variant="light" onClick={markAllPresent}>
                  Mark All Present
                </Button>
                <Button onClick={saveAttendance} disabled={loading}>
                  Save Attendance
                </Button>
              </Group>
            </Group>

            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Roll No</Table.Th>
                    <Table.Th>Student Name</Table.Th>
                    <Table.Th>Present</Table.Th>
                    <Table.Th>Absent</Table.Th>
                    <Table.Th>Late</Table.Th>
                    <Table.Th>Excused</Table.Th>
                    <Table.Th>Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredRecords.map((record) => (
                    <Table.Tr key={record.id}>
                      <Table.Td>{record.roll_number}</Table.Td>
                      <Table.Td>
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl">
                            {record.student_name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Text size="sm">{record.student_name}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          checked={record.status === 'present'}
                          onChange={() => updateAttendance(record.student_id, 'present')}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          checked={record.status === 'absent'}
                          onChange={() => updateAttendance(record.student_id, 'absent')}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          checked={record.status === 'late'}
                          onChange={() => updateAttendance(record.student_id, 'late')}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          checked={record.status === 'excused'}
                          onChange={() => updateAttendance(record.student_id, 'excused')}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            record.status === 'present'
                              ? 'green'
                              : record.status === 'absent'
                              ? 'red'
                              : record.status === 'late'
                              ? 'yellow'
                              : 'blue'
                          }
                          variant="light"
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </>
      )}
    </div>
  )
}