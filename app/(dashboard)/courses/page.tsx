'use client'

import { useState, useEffect } from 'react'
import {
  TextInput,
  Select,
  Button,
  Group,
  Paper,
  Table,
  Badge,
  ActionIcon,
  Title,
  Stack,
  Modal,
  Grid,
  Text,
  Card,
  NumberInput,
  Textarea,
  Accordion,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
  IconBook,
  IconUsers,
  IconClock,
  IconAward,
} from '@tabler/icons-react'

interface Course {
  id: string
  code: string
  name: string
  department: string
  degree_type: 'bachelor' | 'master' | 'diploma' | 'certificate' | 'phd'
  duration_years: number
  total_credits: number
  total_students: number
  subjects: Subject[]
  is_active: boolean
}

interface Subject {
  id: string
  code: string
  name: string
  credits: number
  type: 'core' | 'elective' | 'practical'
  semester: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null)
  const [filterDegreeType, setFilterDegreeType] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [createModalOpened, setCreateModalOpened] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockCourses: Course[] = [
        {
          id: '1',
          code: 'BTCS',
          name: 'Bachelor of Technology - Computer Science',
          department: 'Computer Science',
          degree_type: 'bachelor',
          duration_years: 4,
          total_credits: 180,
          total_students: 240,
          subjects: [
            { id: '1', code: 'CS101', name: 'Programming Fundamentals', credits: 4, type: 'core', semester: 1 },
            { id: '2', code: 'CS201', name: 'Data Structures', credits: 4, type: 'core', semester: 3 },
            { id: '3', code: 'CS301', name: 'Algorithms', credits: 4, type: 'core', semester: 4 },
          ],
          is_active: true,
        },
        {
          id: '2',
          code: 'BTEC',
          name: 'Bachelor of Technology - Electronics',
          department: 'Electronics',
          degree_type: 'bachelor',
          duration_years: 4,
          total_credits: 180,
          total_students: 180,
          subjects: [
            { id: '4', code: 'EC101', name: 'Basic Electronics', credits: 4, type: 'core', semester: 1 },
            { id: '5', code: 'EC201', name: 'Digital Electronics', credits: 4, type: 'core', semester: 3 },
          ],
          is_active: true,
        },
        {
          id: '3',
          code: 'MTCS',
          name: 'Master of Technology - Computer Science',
          department: 'Computer Science',
          degree_type: 'master',
          duration_years: 2,
          total_credits: 90,
          total_students: 60,
          subjects: [
            { id: '6', code: 'MCS501', name: 'Advanced Algorithms', credits: 4, type: 'core', semester: 1 },
            { id: '7', code: 'MCS502', name: 'Machine Learning', credits: 4, type: 'elective', semester: 2 },
          ],
          is_active: true,
        },
      ]
      setCourses(mockCourses)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch courses',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (course: Course) => {
    modals.openConfirmModal({
      title: 'Delete Course',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {course.name}? This will affect {course.total_students} students.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          // Delete logic here
          notifications.show({
            title: 'Success',
            message: 'Course deleted successfully',
            color: 'green',
          })
          fetchCourses()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete course',
            color: 'red',
          })
        }
      },
    })
  }

  const getDegreeTypeColor = (type: Course['degree_type']) => {
    switch (type) {
      case 'bachelor': return 'blue'
      case 'master': return 'green'
      case 'diploma': return 'yellow'
      case 'certificate': return 'orange'
      case 'phd': return 'violet'
      default: return 'gray'
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !filterDepartment || course.department === filterDepartment
    const matchesDegreeType = !filterDegreeType || course.degree_type === filterDegreeType
    
    return matchesSearch && matchesDepartment && matchesDegreeType
  })

  const stats = {
    totalCourses: courses.length,
    totalStudents: courses.reduce((sum, c) => sum + c.total_students, 0),
    activeCourses: courses.filter(c => c.is_active).length,
    totalCredits: courses.reduce((sum, c) => sum + c.total_credits, 0) / courses.length || 0,
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Course Management</Title>
        <Group>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export Curriculum
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
            Add Course
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Courses
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalCourses}
                </Text>
              </div>
              <IconBook size={30} color="gray" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Students
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents}
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
                  Active Courses
                </Text>
                <Text size="xl" fw={700} color="green">
                  {stats.activeCourses}
                </Text>
              </div>
              <IconAward size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Avg Credits
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalCredits.toFixed(0)}
                </Text>
              </div>
              <IconClock size={30} color="orange" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper p="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Search courses..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by department"
              data={['Computer Science', 'Electronics', 'Mechanical', 'Civil']}
              value={filterDepartment}
              onChange={setFilterDepartment}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by degree type"
              data={[
                { value: 'bachelor', label: 'Bachelor' },
                { value: 'master', label: 'Master' },
                { value: 'diploma', label: 'Diploma' },
                { value: 'certificate', label: 'Certificate' },
                { value: 'phd', label: 'PhD' },
              ]}
              value={filterDegreeType}
              onChange={setFilterDegreeType}
              clearable
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Code</Table.Th>
                <Table.Th>Course Name</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Degree Type</Table.Th>
                <Table.Th>Duration</Table.Th>
                <Table.Th>Credits</Table.Th>
                <Table.Th>Students</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredCourses.map((course) => (
                <Table.Tr key={course.id}>
                  <Table.Td>{course.code}</Table.Td>
                  <Table.Td>{course.name}</Table.Td>
                  <Table.Td>{course.department}</Table.Td>
                  <Table.Td>
                    <Badge color={getDegreeTypeColor(course.degree_type)} variant="light">
                      {course.degree_type.toUpperCase()}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{course.duration_years} years</Table.Td>
                  <Table.Td>{course.total_credits}</Table.Td>
                  <Table.Td>{course.total_students}</Table.Td>
                  <Table.Td>
                    <Badge color={course.is_active ? 'green' : 'red'} variant="light">
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedCourse(course)
                          setViewModalOpened(true)
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(course)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* View Course Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Course Details"
        size="xl"
      >
        {selectedCourse && (
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">Course Code</Text>
                <Text size="sm" fw={500}>{selectedCourse.code}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">Course Name</Text>
                <Text size="sm" fw={500}>{selectedCourse.name}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">Department</Text>
                <Text size="sm" fw={500}>{selectedCourse.department}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">Degree Type</Text>
                <Badge color={getDegreeTypeColor(selectedCourse.degree_type)} variant="light">
                  {selectedCourse.degree_type.toUpperCase()}
                </Badge>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" color="dimmed">Duration</Text>
                <Text size="sm" fw={500}>{selectedCourse.duration_years} years</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" color="dimmed">Total Credits</Text>
                <Text size="sm" fw={500}>{selectedCourse.total_credits}</Text>
              </Grid.Col>
              <Grid.Col span={4}>
                <Text size="sm" color="dimmed">Enrolled Students</Text>
                <Text size="sm" fw={500}>{selectedCourse.total_students}</Text>
              </Grid.Col>
            </Grid>

            <div>
              <Text size="sm" fw={600} mb="sm">Subjects</Text>
              <Accordion>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(semester => {
                  const semesterSubjects = selectedCourse.subjects.filter(s => s.semester === semester)
                  if (semesterSubjects.length === 0) return null
                  
                  return (
                    <Accordion.Item key={semester} value={`semester-${semester}`}>
                      <Accordion.Control>
                        Semester {semester} ({semesterSubjects.length} subjects)
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Table>
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Code</Table.Th>
                              <Table.Th>Subject Name</Table.Th>
                              <Table.Th>Credits</Table.Th>
                              <Table.Th>Type</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {semesterSubjects.map(subject => (
                              <Table.Tr key={subject.id}>
                                <Table.Td>{subject.code}</Table.Td>
                                <Table.Td>{subject.name}</Table.Td>
                                <Table.Td>{subject.credits}</Table.Td>
                                <Table.Td>
                                  <Badge variant="light">
                                    {subject.type}
                                  </Badge>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </Accordion.Panel>
                    </Accordion.Item>
                  )
                })}
              </Accordion>
            </div>
          </Stack>
        )}
      </Modal>
    </div>
  )
}