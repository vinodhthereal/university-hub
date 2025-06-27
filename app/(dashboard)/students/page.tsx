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
  Avatar,
  Text,
  Tabs,
  Divider,
  PasswordInput,
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
  IconUpload,
} from '@tabler/icons-react'

interface Student {
  id: string
  student_id: string
  full_name: string
  email: string
  course_name: string
  semester: number
  batch_year: number
  phone: string
  is_active: boolean
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState<string | null>(null)
  const [filterSemester, setFilterSemester] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [editModalOpened, setEditModalOpened] = useState(false)
  const [addModalOpened, setAddModalOpened] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // Fetch students with their user information
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          id,
          student_id,
          batch_year,
          semester,
          users!students_id_fkey (
            email,
            full_name,
            phone,
            is_active
          ),
          courses (
            name
          )
        `)

      if (error) throw error

      // Transform the data to match our interface
      const transformedStudents: Student[] = studentsData?.map((student: any) => ({
        id: student.id,
        student_id: student.student_id,
        full_name: student.users?.full_name || '',
        email: student.users?.email || '',
        course_name: student.courses?.name || '',
        semester: student.semester,
        batch_year: student.batch_year,
        phone: student.users?.phone || '',
        is_active: student.users?.is_active ?? true,
      })) || []

      setStudents(transformedStudents)
    } catch (error: any) {
      console.error('Error fetching students:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to fetch students',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (student: Student) => {
    modals.openConfirmModal({
      title: 'Delete Student',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {student.full_name}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          // Delete student record first
          const { error: studentError } = await supabase
            .from('students')
            .delete()
            .eq('id', student.id)
          
          if (studentError) throw studentError
          
          // Delete user record
          const { error: userError } = await supabase
            .from('users')
            .delete()
            .eq('id', student.id)
          
          if (userError) throw userError
          
          // Note: Deleting from auth requires admin API or user's own action
          // For now, we'll just mark the user as inactive in the users table
          
          notifications.show({
            title: 'Success',
            message: 'Student deleted successfully',
            color: 'green',
          })
          fetchStudents()
        } catch (error: any) {
          console.error('Error deleting student:', error)
          notifications.show({
            title: 'Error',
            message: error.message || 'Failed to delete student',
            color: 'red',
          })
        }
      },
    })
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = !filterCourse || student.course_name === filterCourse
    const matchesSemester = !filterSemester || student.semester.toString() === filterSemester
    
    return matchesSearch && matchesCourse && matchesSemester
  })

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Students Management</Title>
        <Group>
          <Button leftSection={<IconUpload size={16} />} variant="light">
            Import
          </Button>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setAddModalOpened(true)}>
            Add Student
          </Button>
        </Group>
      </Group>

      <Paper p="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Search students..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by course"
              data={[
                { value: 'Bachelor of Computer Science', label: 'Computer Science' },
                { value: 'Bachelor of Electronics', label: 'Electronics' },
                { value: 'Bachelor of Mechanical Engineering', label: 'Mechanical' },
                { value: 'Bachelor of Civil Engineering', label: 'Civil' }
              ]}
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
      </Paper>

      <Paper withBorder>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Student ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Course</Table.Th>
                <Table.Th>Semester</Table.Th>
                <Table.Th>Batch</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>{student.student_id}</Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl">
                        {student.full_name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Text size="sm">{student.full_name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{student.email}</Table.Td>
                  <Table.Td>{student.course_name}</Table.Td>
                  <Table.Td>{student.semester}</Table.Td>
                  <Table.Td>{student.batch_year}</Table.Td>
                  <Table.Td>
                    <Badge color={student.is_active ? 'green' : 'red'} variant="light">
                      {student.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedStudent(student)
                          setViewModalOpened(true)
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedStudent(student)
                          setEditModalOpened(true)
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(student)}
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

      {/* View Student Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Student Details"
        size="lg"
      >
        {selectedStudent && (
          <Stack>
            <Group justify="center">
              <Avatar size="xl" radius="xl">
                {selectedStudent.full_name.split(' ').map(n => n[0]).join('')}
              </Avatar>
            </Group>
            
            <Tabs defaultValue="personal">
              <Tabs.List>
                <Tabs.Tab value="personal">Personal Info</Tabs.Tab>
                <Tabs.Tab value="academic">Academic Info</Tabs.Tab>
                <Tabs.Tab value="contact">Contact Info</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="personal" pt="xs">
                <Stack gap="sm" mt="md">
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Full Name</Text>
                    <Text size="sm" fw={500}>{selectedStudent.full_name}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Student ID</Text>
                    <Text size="sm" fw={500}>{selectedStudent.student_id}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Status</Text>
                    <Badge color={selectedStudent.is_active ? 'green' : 'red'} variant="light">
                      {selectedStudent.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="academic" pt="xs">
                <Stack gap="sm" mt="md">
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Course</Text>
                    <Text size="sm" fw={500}>{selectedStudent.course_name}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Semester</Text>
                    <Text size="sm" fw={500}>{selectedStudent.semester}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Batch Year</Text>
                    <Text size="sm" fw={500}>{selectedStudent.batch_year}</Text>
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="contact" pt="xs">
                <Stack gap="sm" mt="md">
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Email</Text>
                    <Text size="sm" fw={500}>{selectedStudent.email}</Text>
                  </Group>
                  <Divider />
                  <Group justify="space-between">
                    <Text size="sm" color="dimmed">Phone</Text>
                    <Text size="sm" fw={500}>{selectedStudent.phone}</Text>
                  </Group>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        title="Add New Student"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          
          try {
            // First, create the auth user
            const email = formData.get('email') as string
            const password = formData.get('password') as string
            const courseName = formData.get('course') as string
            
            // Get course ID from course name
            const { data: courseData, error: courseError } = await supabase
              .from('courses')
              .select('id')
              .eq('name', courseName)
              .single()
            
            if (courseError) throw new Error('Invalid course selected')
            
            const { data: authData, error: authError } = await supabase.auth.signUp({
              email: email,
              password: password,
              options: {
                data: {
                  full_name: formData.get('full_name'),
                  role: 'student',
                },
              },
            })

            if (authError) throw authError

            if (authData.user) {
              // Create user profile in users table
              const { error: userError } = await supabase
                .from('users')
                .insert({
                  id: authData.user.id,
                  email: email,
                  full_name: formData.get('full_name') as string,
                  role: 'student',
                  phone: formData.get('phone') as string,
                  is_active: true,
                })

              if (userError) throw userError

              // Create student record
              const { error: studentError } = await supabase
                .from('students')
                .insert({
                  id: authData.user.id,
                  student_id: formData.get('student_id') as string,
                  course_id: courseData.id,
                  batch_year: Number(formData.get('batch_year')),
                  semester: Number(formData.get('semester')),
                  admission_date: new Date().toISOString(),
                  permanent_address: { address: 'To be updated' },
                  emergency_contacts: { contact: formData.get('phone') },
                })

              if (studentError) throw studentError

              // Refresh the students list
              await fetchStudents()
              setAddModalOpened(false)
              
              notifications.show({
                title: 'Success',
                message: 'Student added successfully! They can now login with their email and password.',
                color: 'green',
              })
            }
          } catch (error: any) {
            console.error('Error adding student:', error)
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to add student',
              color: 'red',
            })
          }
        }}>
          <Stack>
            <TextInput
              label="Student ID"
              placeholder="Enter student ID (e.g., STU004)"
              name="student_id"
              required
            />
            <TextInput
              label="Full Name"
              placeholder="Enter student's full name"
              name="full_name"
              required
            />
            <TextInput
              label="Email"
              placeholder="student@university.edu"
              type="email"
              name="email"
              required
            />
            <PasswordInput
              label="Password"
              placeholder="Create a password for the student"
              name="password"
              description="Student will use this to login"
              required
              minLength={6}
            />
            <TextInput
              label="Phone Number"
              placeholder="Enter 10-digit phone number"
              name="phone"
              pattern="[0-9]{10}"
              required
            />
            <Select
              label="Course"
              placeholder="Select course"
              name="course"
              data={[
                { value: 'Bachelor of Computer Science', label: 'Computer Science' },
                { value: 'Bachelor of Electronics', label: 'Electronics' },
                { value: 'Bachelor of Mechanical Engineering', label: 'Mechanical' },
                { value: 'Bachelor of Civil Engineering', label: 'Civil' }
              ]}
              required
            />
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Semester"
                  placeholder="Select semester"
                  name="semester"
                  data={['1', '2', '3', '4', '5', '6', '7', '8']}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Batch Year"
                  placeholder="Select batch year"
                  name="batch_year"
                  data={[
                    String(new Date().getFullYear()),
                    String(new Date().getFullYear() - 1),
                    String(new Date().getFullYear() - 2),
                    String(new Date().getFullYear() - 3),
                  ]}
                  defaultValue={String(new Date().getFullYear())}
                  required
                />
              </Grid.Col>
            </Grid>
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setAddModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Student
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  )
}