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
  Card,
  MultiSelect,
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
  IconMail,
  IconPhone,
  IconSchool,
} from '@tabler/icons-react'

interface Faculty {
  id: string
  employee_id: string
  full_name: string
  email: string
  phone: string
  designation: string
  department: string
  specialization: string[]
  experience_years: number
  is_active: boolean
}

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [createModalOpened, setCreateModalOpened] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockFaculty: Faculty[] = [
        {
          id: '1',
          employee_id: 'FAC001',
          full_name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@university.edu',
          phone: '9876543210',
          designation: 'Professor',
          department: 'Computer Science',
          specialization: ['Artificial Intelligence', 'Machine Learning'],
          experience_years: 15,
          is_active: true,
        },
        {
          id: '2',
          employee_id: 'FAC002',
          full_name: 'Dr. Priya Sharma',
          email: 'priya.sharma@university.edu',
          phone: '9876543211',
          designation: 'Associate Professor',
          department: 'Electronics',
          specialization: ['VLSI Design', 'Embedded Systems'],
          experience_years: 10,
          is_active: true,
        },
        {
          id: '3',
          employee_id: 'FAC003',
          full_name: 'Prof. Amit Singh',
          email: 'amit.singh@university.edu',
          phone: '9876543212',
          designation: 'Assistant Professor',
          department: 'Mechanical',
          specialization: ['Thermodynamics', 'Fluid Mechanics'],
          experience_years: 5,
          is_active: true,
        },
      ]
      setFaculty(mockFaculty)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch faculty',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (faculty: Faculty) => {
    modals.openConfirmModal({
      title: 'Delete Faculty',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete {faculty.full_name}? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          // Delete logic here
          notifications.show({
            title: 'Success',
            message: 'Faculty deleted successfully',
            color: 'green',
          })
          fetchFaculty()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to delete faculty',
            color: 'red',
          })
        }
      },
    })
  }

  const filteredFaculty = faculty.filter((member) => {
    const matchesSearch =
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !filterDepartment || member.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const stats = {
    total: faculty.length,
    professors: faculty.filter((f) => f.designation === 'Professor').length,
    associateProfessors: faculty.filter((f) => f.designation === 'Associate Professor').length,
    assistantProfessors: faculty.filter((f) => f.designation === 'Assistant Professor').length,
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Faculty Management</Title>
        <Group>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpened(true)}>
            Add Faculty
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Total Faculty
            </Text>
            <Text size="xl" fw={700} mt="xs">
              {stats.total}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Professors
            </Text>
            <Text size="xl" fw={700} mt="xs">
              {stats.professors}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Associate Prof.
            </Text>
            <Text size="xl" fw={700} mt="xs">
              {stats.associateProfessors}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Assistant Prof.
            </Text>
            <Text size="xl" fw={700} mt="xs">
              {stats.assistantProfessors}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper p="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search faculty..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              placeholder="Filter by department"
              data={['Computer Science', 'Electronics', 'Mechanical', 'Civil']}
              value={filterDepartment}
              onChange={setFilterDepartment}
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
                <Table.Th>Employee ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Designation</Table.Th>
                <Table.Th>Department</Table.Th>
                <Table.Th>Contact</Table.Th>
                <Table.Th>Experience</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredFaculty.map((member) => (
                <Table.Tr key={member.id}>
                  <Table.Td>{member.employee_id}</Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl">
                        {member.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>
                          {member.full_name}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {member.email}
                        </Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>{member.designation}</Table.Td>
                  <Table.Td>{member.department}</Table.Td>
                  <Table.Td>{member.phone}</Table.Td>
                  <Table.Td>{member.experience_years} years</Table.Td>
                  <Table.Td>
                    <Badge color={member.is_active ? 'green' : 'red'} variant="light">
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedFaculty(member)
                          setViewModalOpened(true)
                        }}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle">
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(member)}>
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

      {/* View Faculty Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Faculty Details"
        size="lg"
      >
        {selectedFaculty && (
          <Stack>
            <Group justify="center">
              <Avatar size="xl" radius="xl">
                {selectedFaculty.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Avatar>
            </Group>

            <Grid>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Full Name
                </Text>
                <Text size="sm" fw={500}>
                  {selectedFaculty.full_name}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Employee ID
                </Text>
                <Text size="sm" fw={500}>
                  {selectedFaculty.employee_id}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Email
                </Text>
                <Group gap="xs">
                  <IconMail size={16} />
                  <Text size="sm" fw={500}>
                    {selectedFaculty.email}
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Phone
                </Text>
                <Group gap="xs">
                  <IconPhone size={16} />
                  <Text size="sm" fw={500}>
                    {selectedFaculty.phone}
                  </Text>
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Department
                </Text>
                <Text size="sm" fw={500}>
                  {selectedFaculty.department}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Designation
                </Text>
                <Text size="sm" fw={500}>
                  {selectedFaculty.designation}
                </Text>
              </Grid.Col>
              <Grid.Col span={12}>
                <Text size="sm" color="dimmed">
                  Specializations
                </Text>
                <Group gap="xs">
                  {selectedFaculty.specialization.map((spec, index) => (
                    <Badge key={index} variant="light">
                      {spec}
                    </Badge>
                  ))}
                </Group>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Experience
                </Text>
                <Text size="sm" fw={500}>
                  {selectedFaculty.experience_years} years
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm" color="dimmed">
                  Status
                </Text>
                <Badge color={selectedFaculty.is_active ? 'green' : 'red'} variant="light">
                  {selectedFaculty.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </Grid.Col>
            </Grid>
          </Stack>
        )}
      </Modal>
    </div>
  )
}
