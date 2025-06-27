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
  Textarea,
  Timeline,
  Alert,
  Tabs,
  Avatar,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { modals } from '@mantine/modals'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconPlus,
  IconEye,
  IconCheck,
  IconX,
  IconClock,
  IconCalendar,
  IconMapPin,
  IconPhone,
  IconUser,
  IconFileText,
  IconDownload,
} from '@tabler/icons-react'

interface OutpassRequest {
  id: string
  student_id: string
  student_name: string
  course: string
  room_no: string
  purpose: string
  destination: string
  from_datetime: Date
  to_datetime: Date
  contact_during_leave: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  created_at: Date
  warden_approval?: {
    status: 'pending' | 'approved' | 'rejected'
    approved_by?: string
    approved_at?: Date
    remarks?: string
  }
  hod_approval?: {
    status: 'pending' | 'approved' | 'rejected'
    approved_by?: string
    approved_at?: Date
    remarks?: string
  }
}

export default function OutpassPage() {
  const [activeTab, setActiveTab] = useState<string | null>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [outpassRequests, setOutpassRequests] = useState<OutpassRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<OutpassRequest | null>(null)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [createModalOpened, setCreateModalOpened] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string>('student')

  const supabase = createClient()

  useEffect(() => {
    fetchOutpassRequests()
    fetchUserRole()
  }, [activeTab])

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
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

  const fetchOutpassRequests = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockRequests: OutpassRequest[] = [
        {
          id: '1',
          student_id: 'STU001',
          student_name: 'John Doe',
          course: 'B.Tech CS',
          room_no: 'A-101',
          purpose: 'Medical appointment',
          destination: 'City Hospital',
          from_datetime: new Date('2024-02-10T10:00:00'),
          to_datetime: new Date('2024-02-10T14:00:00'),
          contact_during_leave: '9876543210',
          status: 'pending',
          created_at: new Date('2024-02-09T18:00:00'),
          warden_approval: {
            status: 'pending',
          },
        },
        {
          id: '2',
          student_id: 'STU002',
          student_name: 'Jane Smith',
          course: 'B.Tech ECE',
          room_no: 'B-205',
          purpose: 'Family emergency',
          destination: 'Home Town',
          from_datetime: new Date('2024-02-11T08:00:00'),
          to_datetime: new Date('2024-02-13T20:00:00'),
          contact_during_leave: '9876543211',
          status: 'approved',
          created_at: new Date('2024-02-08T15:00:00'),
          warden_approval: {
            status: 'approved',
            approved_by: 'Warden Name',
            approved_at: new Date('2024-02-08T16:00:00'),
          },
          hod_approval: {
            status: 'approved',
            approved_by: 'HOD Name',
            approved_at: new Date('2024-02-08T17:00:00'),
          },
        },
        {
          id: '3',
          student_id: 'STU003',
          student_name: 'Mike Johnson',
          course: 'B.Tech ME',
          room_no: 'C-302',
          purpose: 'Personal work',
          destination: 'City Center',
          from_datetime: new Date('2024-02-09T14:00:00'),
          to_datetime: new Date('2024-02-09T18:00:00'),
          contact_during_leave: '9876543212',
          status: 'rejected',
          created_at: new Date('2024-02-09T10:00:00'),
          warden_approval: {
            status: 'rejected',
            approved_by: 'Warden Name',
            approved_at: new Date('2024-02-09T11:00:00'),
            remarks: 'Insufficient reason provided',
          },
        },
      ]
      
      const filteredByTab = mockRequests.filter(request => {
        if (activeTab === 'pending') return request.status === 'pending'
        if (activeTab === 'approved') return request.status === 'approved'
        if (activeTab === 'rejected') return request.status === 'rejected'
        return true
      })
      
      setOutpassRequests(filteredByTab)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch outpass requests',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (request: OutpassRequest) => {
    modals.openConfirmModal({
      title: 'Approve Outpass',
      centered: true,
      children: (
        <Stack>
          <Text size="sm">
            Are you sure you want to approve the outpass request for {request.student_name}?
          </Text>
          <Textarea
            placeholder="Add remarks (optional)"
            label="Remarks"
            minRows={3}
          />
        </Stack>
      ),
      labels: { confirm: 'Approve', cancel: 'Cancel' },
      confirmProps: { color: 'green' },
      onConfirm: async () => {
        try {
          // Approval logic here
          notifications.show({
            title: 'Success',
            message: 'Outpass approved successfully',
            color: 'green',
          })
          fetchOutpassRequests()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to approve outpass',
            color: 'red',
          })
        }
      },
    })
  }

  const handleReject = (request: OutpassRequest) => {
    modals.openConfirmModal({
      title: 'Reject Outpass',
      centered: true,
      children: (
        <Stack>
          <Text size="sm">
            Are you sure you want to reject the outpass request for {request.student_name}?
          </Text>
          <Textarea
            placeholder="Please provide a reason for rejection"
            label="Reason"
            required
            minRows={3}
          />
        </Stack>
      ),
      labels: { confirm: 'Reject', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          // Rejection logic here
          notifications.show({
            title: 'Success',
            message: 'Outpass rejected',
            color: 'green',
          })
          fetchOutpassRequests()
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to reject outpass',
            color: 'red',
          })
        }
      },
    })
  }

  const getStatusColor = (status: OutpassRequest['status']) => {
    switch (status) {
      case 'approved': return 'green'
      case 'rejected': return 'red'
      case 'pending': return 'yellow'
      case 'expired': return 'gray'
      default: return 'gray'
    }
  }

  const stats = {
    total: outpassRequests.length,
    pending: outpassRequests.filter(r => r.status === 'pending').length,
    approved: outpassRequests.filter(r => r.status === 'approved').length,
    rejected: outpassRequests.filter(r => r.status === 'rejected').length,
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Out-Pass Management</Title>
        <Group>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export Report
          </Button>
          {userRole === 'student' && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
            >
              Request Out-Pass
            </Button>
          )}
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Total Requests
            </Text>
            <Text size="xl" fw={700} mt="xs">
              {stats.total}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Pending
            </Text>
            <Text size="xl" fw={700} mt="xs" color="yellow">
              {stats.pending}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Approved
            </Text>
            <Text size="xl" fw={700} mt="xs" color="green">
              {stats.approved}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
              Rejected
            </Text>
            <Text size="xl" fw={700} mt="xs" color="red">
              {stats.rejected}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="pending" leftSection={<IconClock size={16} />}>
              Pending
            </Tabs.Tab>
            <Tabs.Tab value="approved" leftSection={<IconCheck size={16} />}>
              Approved
            </Tabs.Tab>
            <Tabs.Tab value="rejected" leftSection={<IconX size={16} />}>
              Rejected
            </Tabs.Tab>
            <Tabs.Tab value="all" leftSection={<IconFileText size={16} />}>
              All Requests
            </Tabs.Tab>
          </Tabs.List>

          <div className="p-4">
            <TextInput
              placeholder="Search by name or student ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              mb="md"
            />

            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Student</Table.Th>
                    <Table.Th>Purpose</Table.Th>
                    <Table.Th>Destination</Table.Th>
                    <Table.Th>Duration</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {outpassRequests
                    .filter(request =>
                      request.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      request.student_id.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((request) => (
                      <Table.Tr key={request.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl">
                              {request.student_name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={500}>{request.student_name}</Text>
                              <Text size="xs" color="dimmed">
                                {request.course} | Room {request.room_no}
                              </Text>
                            </div>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {request.purpose}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {request.destination}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Stack gap={0}>
                            <Text size="xs">
                              {request.from_datetime.toLocaleDateString()}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {request.from_datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {request.to_datetime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </Stack>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={getStatusColor(request.status)} variant="light">
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" color="dimmed">
                            {request.created_at.toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="subtle"
                              onClick={() => {
                                setSelectedRequest(request)
                                setViewModalOpened(true)
                              }}
                            >
                              <IconEye size={16} />
                            </ActionIcon>
                            {userRole !== 'student' && request.status === 'pending' && (
                              <>
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={() => handleApprove(request)}
                                >
                                  <IconCheck size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleReject(request)}
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </div>
        </Tabs>
      </Paper>

      {/* View Details Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Out-Pass Details"
        size="lg"
      >
        {selectedRequest && (
          <Stack>
            <Group justify="space-between">
              <Group>
                <Avatar size="lg" radius="xl">
                  {selectedRequest.student_name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <div>
                  <Text fw={600}>{selectedRequest.student_name}</Text>
                  <Text size="sm" color="dimmed">
                    {selectedRequest.student_id} | {selectedRequest.course}
                  </Text>
                </div>
              </Group>
              <Badge color={getStatusColor(selectedRequest.status)} variant="light" size="lg">
                {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
              </Badge>
            </Group>

            <Paper withBorder p="md">
              <Stack spacing="sm">
                <Group>
                  <IconFileText size={20} />
                  <div>
                    <Text size="xs" color="dimmed">Purpose</Text>
                    <Text size="sm">{selectedRequest.purpose}</Text>
                  </div>
                </Group>
                <Group>
                  <IconMapPin size={20} />
                  <div>
                    <Text size="xs" color="dimmed">Destination</Text>
                    <Text size="sm">{selectedRequest.destination}</Text>
                  </div>
                </Group>
                <Group>
                  <IconCalendar size={20} />
                  <div>
                    <Text size="xs" color="dimmed">Duration</Text>
                    <Text size="sm">
                      {selectedRequest.from_datetime.toLocaleString()} - {selectedRequest.to_datetime.toLocaleString()}
                    </Text>
                  </div>
                </Group>
                <Group>
                  <IconPhone size={20} />
                  <div>
                    <Text size="xs" color="dimmed">Contact During Leave</Text>
                    <Text size="sm">{selectedRequest.contact_during_leave}</Text>
                  </div>
                </Group>
              </Stack>
            </Paper>

            <Timeline active={1} bulletSize={24} lineWidth={2}>
              <Timeline.Item
                bullet={<IconUser size={12} />}
                title="Request Submitted"
              >
                <Text color="dimmed" size="sm">
                  {selectedRequest.created_at.toLocaleString()}
                </Text>
              </Timeline.Item>
              
              {selectedRequest.warden_approval && (
                <Timeline.Item
                  bullet={
                    selectedRequest.warden_approval.status === 'approved' ? (
                      <IconCheck size={12} />
                    ) : selectedRequest.warden_approval.status === 'rejected' ? (
                      <IconX size={12} />
                    ) : (
                      <IconClock size={12} />
                    )
                  }
                  title="Warden Approval"
                  color={
                    selectedRequest.warden_approval.status === 'approved'
                      ? 'green'
                      : selectedRequest.warden_approval.status === 'rejected'
                      ? 'red'
                      : 'yellow'
                  }
                >
                  <Text color="dimmed" size="sm">
                    {selectedRequest.warden_approval.status === 'pending'
                      ? 'Pending'
                      : `${selectedRequest.warden_approval.status} by ${selectedRequest.warden_approval.approved_by}`}
                  </Text>
                  {selectedRequest.warden_approval.approved_at && (
                    <Text color="dimmed" size="xs">
                      {selectedRequest.warden_approval.approved_at.toLocaleString()}
                    </Text>
                  )}
                  {selectedRequest.warden_approval.remarks && (
                    <Text size="xs" mt="xs">
                      Remarks: {selectedRequest.warden_approval.remarks}
                    </Text>
                  )}
                </Timeline.Item>
              )}

              {selectedRequest.hod_approval && (
                <Timeline.Item
                  bullet={
                    selectedRequest.hod_approval.status === 'approved' ? (
                      <IconCheck size={12} />
                    ) : selectedRequest.hod_approval.status === 'rejected' ? (
                      <IconX size={12} />
                    ) : (
                      <IconClock size={12} />
                    )
                  }
                  title="HOD Approval"
                  color={
                    selectedRequest.hod_approval.status === 'approved'
                      ? 'green'
                      : selectedRequest.hod_approval.status === 'rejected'
                      ? 'red'
                      : 'yellow'
                  }
                >
                  <Text color="dimmed" size="sm">
                    {selectedRequest.hod_approval.status === 'pending'
                      ? 'Pending'
                      : `${selectedRequest.hod_approval.status} by ${selectedRequest.hod_approval.approved_by}`}
                  </Text>
                  {selectedRequest.hod_approval.approved_at && (
                    <Text color="dimmed" size="xs">
                      {selectedRequest.hod_approval.approved_at.toLocaleString()}
                    </Text>
                  )}
                </Timeline.Item>
              )}
            </Timeline>
          </Stack>
        )}
      </Modal>
    </div>
  )
}