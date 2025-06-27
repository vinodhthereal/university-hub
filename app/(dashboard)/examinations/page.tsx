'use client'

import { useState, useEffect } from 'react'
import {
  Paper,
  Title,
  Group,
  TextInput,
  Select,
  Button,
  Table,
  Badge,
  ActionIcon,
  Text,
  Grid,
  Card,
  Stack,
  Modal,
  NumberInput,
  Tabs,
  Progress,
  Timeline,
  Alert,
  Divider,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconEye,
  IconDownload,
  IconUpload,
  IconCalendar,
  IconClock,
  IconFileText,
  IconTrophy,
  IconAlertCircle,
  IconChartBar,
} from '@tabler/icons-react'

interface Examination {
  id: string
  name: string
  type: 'internal' | 'semester' | 'supplementary'
  course: string
  semester: number
  start_date: Date
  end_date: Date
  status: 'upcoming' | 'ongoing' | 'completed' | 'results_declared'
  subjects: ExamSubject[]
}

interface ExamSubject {
  id: string
  subject_name: string
  subject_code: string
  exam_date: Date
  start_time: string
  end_time: string
  max_marks: number
  passing_marks: number
  venue: string
}

interface Result {
  id: string
  student_id: string
  student_name: string
  roll_number: string
  marks: { [subjectId: string]: number }
  total_marks: number
  percentage: number
  grade: string
  status: 'pass' | 'fail'
}

export default function ExaminationsPage() {
  const [activeTab, setActiveTab] = useState<string | null>('schedule')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string | null>(null)
  const [filterSemester, setFilterSemester] = useState<string | null>(null)
  const [examinations, setExaminations] = useState<Examination[]>([])
  const [selectedExam, setSelectedExam] = useState<Examination | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [marksEntryModalOpened, setMarksEntryModalOpened] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('student')

  const supabase = createClient()

  useEffect(() => {
    fetchExaminations()
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userData) {
        setUserRole(userData.role)
      }
    }
  }

  const fetchExaminations = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockExams: Examination[] = [
        {
          id: '1',
          name: 'Mid-Semester Examination',
          type: 'internal',
          course: 'B.Tech Computer Science',
          semester: 3,
          start_date: new Date('2024-03-15'),
          end_date: new Date('2024-03-22'),
          status: 'upcoming',
          subjects: [
            {
              id: '1',
              subject_name: 'Data Structures',
              subject_code: 'CS301',
              exam_date: new Date('2024-03-15'),
              start_time: '10:00',
              end_time: '13:00',
              max_marks: 100,
              passing_marks: 40,
              venue: 'Hall A',
            },
            {
              id: '2',
              subject_name: 'Algorithms',
              subject_code: 'CS302',
              exam_date: new Date('2024-03-17'),
              start_time: '10:00',
              end_time: '13:00',
              max_marks: 100,
              passing_marks: 40,
              venue: 'Hall B',
            },
          ],
        },
        {
          id: '2',
          name: 'End-Semester Examination',
          type: 'semester',
          course: 'B.Tech Electronics',
          semester: 5,
          start_date: new Date('2024-01-10'),
          end_date: new Date('2024-01-20'),
          status: 'results_declared',
          subjects: [
            {
              id: '3',
              subject_name: 'Digital Signal Processing',
              subject_code: 'EC501',
              exam_date: new Date('2024-01-10'),
              start_time: '14:00',
              end_time: '17:00',
              max_marks: 100,
              passing_marks: 40,
              venue: 'Hall C',
            },
          ],
        },
      ]

      setExaminations(mockExams)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch examinations',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async (examId: string) => {
    try {
      // Mock results data
      const mockResults: Result[] = [
        {
          id: '1',
          student_id: 'STU001',
          student_name: 'John Doe',
          roll_number: '001',
          marks: { '1': 85, '2': 78 },
          total_marks: 163,
          percentage: 81.5,
          grade: 'A',
          status: 'pass',
        },
        {
          id: '2',
          student_id: 'STU002',
          student_name: 'Jane Smith',
          roll_number: '002',
          marks: { '1': 92, '2': 88 },
          total_marks: 180,
          percentage: 90,
          grade: 'A+',
          status: 'pass',
        },
        {
          id: '3',
          student_id: 'STU003',
          student_name: 'Mike Johnson',
          roll_number: '003',
          marks: { '1': 35, '2': 42 },
          total_marks: 77,
          percentage: 38.5,
          grade: 'F',
          status: 'fail',
        },
      ]

      setResults(mockResults)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch results',
        color: 'red',
      })
    }
  }

  const getStatusColor = (status: Examination['status']) => {
    switch (status) {
      case 'upcoming':
        return 'blue'
      case 'ongoing':
        return 'yellow'
      case 'completed':
        return 'green'
      case 'results_declared':
        return 'violet'
      default:
        return 'gray'
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'green'
      case 'A':
        return 'green'
      case 'B':
        return 'blue'
      case 'C':
        return 'yellow'
      case 'D':
        return 'orange'
      case 'F':
        return 'red'
      default:
        return 'gray'
    }
  }

  const stats = {
    totalExams: examinations.length,
    upcoming: examinations.filter((e) => e.status === 'upcoming').length,
    ongoing: examinations.filter((e) => e.status === 'ongoing').length,
    completed: examinations.filter((e) => e.status === 'completed').length,
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Examination Management</Title>
        <Group>
          <Button leftSection={<IconCalendar size={16} />} variant="light">
            Academic Calendar
          </Button>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export Schedule
          </Button>
          {userRole === 'admin' && (
            <Button leftSection={<IconPlus size={16} />}>Create Exam</Button>
          )}
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Exams
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalExams}
                </Text>
              </div>
              <IconFileText size={30} color="gray" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Upcoming
                </Text>
                <Text size="xl" fw={700} color="blue">
                  {stats.upcoming}
                </Text>
              </div>
              <IconClock size={30} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Ongoing
                </Text>
                <Text size="xl" fw={700} color="yellow">
                  {stats.ongoing}
                </Text>
              </div>
              <IconAlertCircle size={30} color="orange" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Completed
                </Text>
                <Text size="xl" fw={700} color="green">
                  {stats.completed}
                </Text>
              </div>
              <IconTrophy size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="schedule" leftSection={<IconCalendar size={16} />}>
              Exam Schedule
            </Tabs.Tab>
            <Tabs.Tab value="results" leftSection={<IconChartBar size={16} />}>
              Results
            </Tabs.Tab>
            {userRole !== 'student' && (
              <Tabs.Tab value="marks" leftSection={<IconEdit size={16} />}>
                Marks Entry
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="schedule" pt="xs">
            <div className="p-4">
              <Grid mb="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    placeholder="Search examinations..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Filter by course"
                    data={['B.Tech Computer Science', 'B.Tech Electronics', 'B.Tech Mechanical']}
                    value={filterCourse}
                    onChange={setFilterCourse}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Filter by semester"
                    data={['1', '2', '3', '4', '5', '6', '7', '8']}
                    value={filterSemester}
                    onChange={setFilterSemester}
                    clearable
                  />
                </Grid.Col>
              </Grid>

              <Stack gap="md">
                {examinations
                  .filter(
                    (exam) =>
                      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      (!filterCourse || exam.course === filterCourse) &&
                      (!filterSemester || exam.semester.toString() === filterSemester)
                  )
                  .map((exam) => (
                    <Paper key={exam.id} withBorder p="md">
                      <Group justify="space-between" mb="md">
                        <div>
                          <Text fw={600} size="lg">
                            {exam.name}
                          </Text>
                          <Text size="sm" color="dimmed">
                            {exam.course} - Semester {exam.semester}
                          </Text>
                        </div>
                        <Badge color={getStatusColor(exam.status)} variant="light" size="lg">
                          {exam.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </Group>

                      <Grid>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Text size="sm" color="dimmed">
                            Duration
                          </Text>
                          <Text size="sm">
                            {exam.start_date.toLocaleDateString()} -{' '}
                            {exam.end_date.toLocaleDateString()}
                          </Text>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Text size="sm" color="dimmed">
                            Total Subjects
                          </Text>
                          <Text size="sm">{exam.subjects.length}</Text>
                        </Grid.Col>
                      </Grid>

                      <Divider my="md" />

                      <Table.ScrollContainer minWidth={600}>
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Subject</Table.Th>
                              <Table.Th>Code</Table.Th>
                              <Table.Th>Date</Table.Th>
                              <Table.Th>Time</Table.Th>
                              <Table.Th>Venue</Table.Th>
                              <Table.Th>Max Marks</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {exam.subjects.map((subject) => (
                              <Table.Tr key={subject.id}>
                                <Table.Td>{subject.subject_name}</Table.Td>
                                <Table.Td>{subject.subject_code}</Table.Td>
                                <Table.Td>{subject.exam_date.toLocaleDateString()}</Table.Td>
                                <Table.Td>
                                  {subject.start_time} - {subject.end_time}
                                </Table.Td>
                                <Table.Td>{subject.venue}</Table.Td>
                                <Table.Td>{subject.max_marks}</Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Table.ScrollContainer>

                      <Group justify="flex-end" mt="md">
                        {exam.status === 'results_declared' && (
                          <Button
                            variant="light"
                            leftSection={<IconEye size={16} />}
                            onClick={() => {
                              setSelectedExam(exam)
                              fetchResults(exam.id)
                              setActiveTab('results')
                            }}
                          >
                            View Results
                          </Button>
                        )}
                        {userRole !== 'student' && exam.status === 'completed' && (
                          <Button
                            leftSection={<IconEdit size={16} />}
                            onClick={() => {
                              setSelectedExam(exam)
                              setMarksEntryModalOpened(true)
                            }}
                          >
                            Enter Marks
                          </Button>
                        )}
                      </Group>
                    </Paper>
                  ))}
              </Stack>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="results" pt="xs">
            <div className="p-4">
              {selectedExam && results.length > 0 ? (
                <Stack>
                  <Group justify="space-between">
                    <div>
                      <Text fw={600} size="lg">
                        {selectedExam.name} Results
                      </Text>
                      <Text size="sm" color="dimmed">
                        {selectedExam.course} - Semester {selectedExam.semester}
                      </Text>
                    </div>
                    <Button leftSection={<IconDownload size={16} />} variant="light">
                      Download Results
                    </Button>
                  </Group>

                  <Grid mb="md">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Card withBorder p="md">
                        <Text size="sm" color="dimmed">
                          Total Students
                        </Text>
                        <Text size="xl" fw={700}>
                          {results.length}
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Card withBorder p="md">
                        <Text size="sm" color="dimmed">
                          Pass Percentage
                        </Text>
                        <Text size="xl" fw={700} color="green">
                          {Math.round(
                            (results.filter((r) => r.status === 'pass').length / results.length) *
                              100
                          )}
                          %
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Card withBorder p="md">
                        <Text size="sm" color="dimmed">
                          Highest Score
                        </Text>
                        <Text size="xl" fw={700} color="blue">
                          {Math.max(...results.map((r) => r.percentage))}%
                        </Text>
                      </Card>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Card withBorder p="md">
                        <Text size="sm" color="dimmed">
                          Average Score
                        </Text>
                        <Text size="xl" fw={700}>
                          {(
                            results.reduce((sum, r) => sum + r.percentage, 0) / results.length
                          ).toFixed(1)}
                          %
                        </Text>
                      </Card>
                    </Grid.Col>
                  </Grid>

                  <Table.ScrollContainer minWidth={800}>
                    <Table verticalSpacing="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Roll No</Table.Th>
                          <Table.Th>Student Name</Table.Th>
                          {selectedExam.subjects.map((subject) => (
                            <Table.Th key={subject.id}>{subject.subject_code}</Table.Th>
                          ))}
                          <Table.Th>Total</Table.Th>
                          <Table.Th>Percentage</Table.Th>
                          <Table.Th>Grade</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {results.map((result) => (
                          <Table.Tr key={result.id}>
                            <Table.Td>{result.roll_number}</Table.Td>
                            <Table.Td>{result.student_name}</Table.Td>
                            {selectedExam.subjects.map((subject) => (
                              <Table.Td key={subject.id}>
                                {result.marks[subject.id] || '-'}
                              </Table.Td>
                            ))}
                            <Table.Td fw={600}>{result.total_marks}</Table.Td>
                            <Table.Td>{result.percentage}%</Table.Td>
                            <Table.Td>
                              <Badge color={getGradeColor(result.grade)} variant="light">
                                {result.grade}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={result.status === 'pass' ? 'green' : 'red'}
                                variant="light"
                              >
                                {result.status.toUpperCase()}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Stack>
              ) : (
                <Alert icon={<IconAlertCircle size={16} />} color="blue">
                  Select an examination from the schedule tab to view results.
                </Alert>
              )}
            </div>
          </Tabs.Panel>

          {userRole !== 'student' && (
            <Tabs.Panel value="marks" pt="xs">
              <div className="p-4">
                <Alert icon={<IconAlertCircle size={16} />} color="blue" mb="md">
                  Select an examination from the schedule tab and click "Enter Marks" to input
                  student marks.
                </Alert>
                {/* Marks entry interface would go here */}
              </div>
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>
    </div>
  )
}
