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
  Avatar,
  Progress,
  Tabs,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconBed,
  IconUsers,
  IconHome,
  IconAlertCircle,
  IconTool,
  IconEdit,
  IconEye,
} from '@tabler/icons-react'

interface Room {
  id: string
  room_number: string
  building: string
  floor: number
  capacity: number
  current_occupancy: number
  room_type: 'single' | 'double' | 'triple' | 'dormitory'
  status: 'available' | 'full' | 'maintenance'
}

interface RoomAllocation {
  id: string
  student_name: string
  student_id: string
  room_number: string
  allocated_date: Date
  bed_number: string
}

export default function HostelPage() {
  const [activeTab, setActiveTab] = useState<string | null>('rooms')
  const [rooms, setRooms] = useState<Room[]>([])
  const [allocations, setAllocations] = useState<RoomAllocation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBuilding, setFilterBuilding] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchRooms()
    fetchAllocations()
  }, [])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      // Mock data
      const mockRooms: Room[] = [
        {
          id: '1',
          room_number: 'A-101',
          building: 'Block A',
          floor: 1,
          capacity: 2,
          current_occupancy: 1,
          room_type: 'double',
          status: 'available',
        },
        {
          id: '2',
          room_number: 'A-102',
          building: 'Block A',
          floor: 1,
          capacity: 2,
          current_occupancy: 2,
          room_type: 'double',
          status: 'full',
        },
        {
          id: '3',
          room_number: 'B-201',
          building: 'Block B',
          floor: 2,
          capacity: 3,
          current_occupancy: 2,
          room_type: 'triple',
          status: 'available',
        },
      ]
      setRooms(mockRooms)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch room data',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllocations = async () => {
    try {
      // Mock data
      const mockAllocations: RoomAllocation[] = [
        {
          id: '1',
          student_name: 'John Doe',
          student_id: 'STU001',
          room_number: 'A-101',
          allocated_date: new Date('2024-01-15'),
          bed_number: 'Bed 1',
        },
        {
          id: '2',
          student_name: 'Jane Smith',
          student_id: 'STU002',
          room_number: 'A-102',
          allocated_date: new Date('2024-01-10'),
          bed_number: 'Bed 1',
        },
      ]
      setAllocations(mockAllocations)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch allocation data',
        color: 'red',
      })
    }
  }

  const stats = {
    totalRooms: rooms.length,
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    currentOccupancy: rooms.reduce((sum, r) => sum + r.current_occupancy, 0),
    availableRooms: rooms.filter((r) => r.status === 'available').length,
  }

  const occupancyRate =
    stats.totalCapacity > 0 ? Math.round((stats.currentOccupancy / stats.totalCapacity) * 100) : 0

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Hostel Management</Title>
        <Button leftSection={<IconHome size={16} />}>Room Allocation</Button>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Rooms
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalRooms}
                </Text>
              </div>
              <IconHome size={30} color="gray" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Capacity
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalCapacity}
                </Text>
              </div>
              <IconBed size={30} color="blue" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Current Occupancy
                </Text>
                <Text size="xl" fw={700}>
                  {stats.currentOccupancy}
                </Text>
              </div>
              <IconUsers size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Occupancy Rate
                </Text>
                <Text size="xl" fw={700}>
                  {occupancyRate}%
                </Text>
              </div>
              <Progress value={occupancyRate} size="xl" radius="xl" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="rooms" leftSection={<IconHome size={16} />}>
              Room Status
            </Tabs.Tab>
            <Tabs.Tab value="allocations" leftSection={<IconUsers size={16} />}>
              Allocations
            </Tabs.Tab>
            <Tabs.Tab value="maintenance" leftSection={<IconTool size={16} />}>
              Maintenance
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="rooms" pt="xs">
            <div className="p-4">
              <Grid mb="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <TextInput
                    placeholder="Search rooms..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Filter by building"
                    data={['Block A', 'Block B', 'Block C']}
                    value={filterBuilding}
                    onChange={setFilterBuilding}
                    clearable
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Filter by status"
                    data={[
                      { value: 'available', label: 'Available' },
                      { value: 'full', label: 'Full' },
                      { value: 'maintenance', label: 'Under Maintenance' },
                    ]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    clearable
                  />
                </Grid.Col>
              </Grid>

              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Room Number</Table.Th>
                      <Table.Th>Building</Table.Th>
                      <Table.Th>Floor</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Occupancy</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {rooms
                      .filter((room) => {
                        const matchesSearch = room.room_number
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                        const matchesBuilding = !filterBuilding || room.building === filterBuilding
                        const matchesStatus = !filterStatus || room.status === filterStatus
                        return matchesSearch && matchesBuilding && matchesStatus
                      })
                      .map((room) => (
                        <Table.Tr key={room.id}>
                          <Table.Td>{room.room_number}</Table.Td>
                          <Table.Td>{room.building}</Table.Td>
                          <Table.Td>{room.floor}</Table.Td>
                          <Table.Td>
                            <Badge variant="light">{room.room_type}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">
                              {room.current_occupancy}/{room.capacity}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                room.status === 'available'
                                  ? 'green'
                                  : room.status === 'full'
                                    ? 'red'
                                    : 'yellow'
                              }
                              variant="light"
                            >
                              {room.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle">
                                <IconEye size={16} />
                              </ActionIcon>
                              <ActionIcon variant="subtle">
                                <IconEdit size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="allocations" pt="xs">
            <div className="p-4">
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Student ID</Table.Th>
                      <Table.Th>Room Number</Table.Th>
                      <Table.Th>Bed Number</Table.Th>
                      <Table.Th>Allocated Date</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {allocations.map((allocation) => (
                      <Table.Tr key={allocation.id}>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl">
                              {allocation.student_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </Avatar>
                            <Text size="sm">{allocation.student_name}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>{allocation.student_id}</Table.Td>
                        <Table.Td>{allocation.room_number}</Table.Td>
                        <Table.Td>{allocation.bed_number}</Table.Td>
                        <Table.Td>{allocation.allocated_date.toLocaleDateString()}</Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon variant="subtle">
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle">
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="maintenance" pt="xs">
            <div className="p-4">
              <Text color="dimmed">Maintenance requests and schedules coming soon...</Text>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  )
}
