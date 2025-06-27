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
  Timeline,
  Alert,
  Progress,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconDownload,
  IconCash,
  IconReceipt,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconFileText,
  IconPrinter,
} from '@tabler/icons-react'

interface FeeRecord {
  id: string
  student_id: string
  student_name: string
  course: string
  semester: number
  total_fees: number
  paid_amount: number
  pending_amount: number
  due_date: Date
  last_payment_date: Date | null
  status: 'paid' | 'partial' | 'pending' | 'overdue'
}

interface PaymentHistory {
  id: string
  date: Date
  amount: number
  mode: string
  transaction_id: string
  receipt_no: string
}

export default function FeesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterCourse, setFilterCourse] = useState<string | null>(null)
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [selectedStudent, setSelectedStudent] = useState<FeeRecord | null>(null)
  const [paymentModalOpened, setPaymentModalOpened] = useState(false)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchFeeRecords()
  }, [])

  const fetchFeeRecords = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockRecords: FeeRecord[] = [
        {
          id: '1',
          student_id: 'STU001',
          student_name: 'John Doe',
          course: 'Computer Science',
          semester: 3,
          total_fees: 150000,
          paid_amount: 150000,
          pending_amount: 0,
          due_date: new Date('2024-01-15'),
          last_payment_date: new Date('2024-01-10'),
          status: 'paid',
        },
        {
          id: '2',
          student_id: 'STU002',
          student_name: 'Jane Smith',
          course: 'Electronics',
          semester: 5,
          total_fees: 145000,
          paid_amount: 100000,
          pending_amount: 45000,
          due_date: new Date('2024-02-15'),
          last_payment_date: new Date('2024-01-05'),
          status: 'partial',
        },
        {
          id: '3',
          student_id: 'STU003',
          student_name: 'Mike Johnson',
          course: 'Mechanical',
          semester: 7,
          total_fees: 140000,
          paid_amount: 0,
          pending_amount: 140000,
          due_date: new Date('2023-12-15'),
          last_payment_date: null,
          status: 'overdue',
        },
        {
          id: '4',
          student_id: 'STU004',
          student_name: 'Sarah Williams',
          course: 'Civil',
          semester: 2,
          total_fees: 135000,
          paid_amount: 0,
          pending_amount: 135000,
          due_date: new Date('2024-03-15'),
          last_payment_date: null,
          status: 'pending',
        },
      ]
      
      setFeeRecords(mockRecords)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch fee records',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentHistory = async (studentId: string) => {
    try {
      // Mock payment history
      const mockHistory: PaymentHistory[] = [
        {
          id: '1',
          date: new Date('2024-01-10'),
          amount: 75000,
          mode: 'Online',
          transaction_id: 'TXN123456789',
          receipt_no: 'RCP001',
        },
        {
          id: '2',
          date: new Date('2023-09-15'),
          amount: 75000,
          mode: 'Bank Transfer',
          transaction_id: 'TXN987654321',
          receipt_no: 'RCP002',
        },
      ]
      
      setPaymentHistory(mockHistory)
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch payment history',
        color: 'red',
      })
    }
  }

  const handlePayment = async (values: any) => {
    try {
      // Payment processing logic here
      notifications.show({
        title: 'Success',
        message: 'Payment processed successfully',
        color: 'green',
      })
      setPaymentModalOpened(false)
      fetchFeeRecords()
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to process payment',
        color: 'red',
      })
    }
  }

  const filteredRecords = feeRecords.filter((record) => {
    const matchesSearch = 
      record.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.student_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !filterStatus || record.status === filterStatus
    const matchesCourse = !filterCourse || record.course === filterCourse
    
    return matchesSearch && matchesStatus && matchesCourse
  })

  const stats = {
    totalCollected: feeRecords.reduce((sum, r) => sum + r.paid_amount, 0),
    totalPending: feeRecords.reduce((sum, r) => sum + r.pending_amount, 0),
    paidStudents: feeRecords.filter(r => r.status === 'paid').length,
    overdueStudents: feeRecords.filter(r => r.status === 'overdue').length,
  }

  const getStatusColor = (status: FeeRecord['status']) => {
    switch (status) {
      case 'paid': return 'green'
      case 'partial': return 'yellow'
      case 'pending': return 'blue'
      case 'overdue': return 'red'
      default: return 'gray'
    }
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Fee Management</Title>
        <Group>
          <Button leftSection={<IconFileText size={16} />} variant="light">
            Fee Structure
          </Button>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export Report
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Collected
                </Text>
                <Text size="xl" fw={700} color="green">
                  ₹{stats.totalCollected.toLocaleString()}
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
                  Total Pending
                </Text>
                <Text size="xl" fw={700} color="red">
                  ₹{stats.totalPending.toLocaleString()}
                </Text>
              </div>
              <IconAlertCircle size={30} color="red" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Paid Students
                </Text>
                <Text size="xl" fw={700}>
                  {stats.paidStudents}
                </Text>
              </div>
              <IconCheck size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Overdue
                </Text>
                <Text size="xl" fw={700} color="red">
                  {stats.overdueStudents}
                </Text>
              </div>
              <IconClock size={30} color="red" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper p="md" withBorder mb="xl">
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              placeholder="Search by name or ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by status"
              data={[
                { value: 'paid', label: 'Paid' },
                { value: 'partial', label: 'Partial' },
                { value: 'pending', label: 'Pending' },
                { value: 'overdue', label: 'Overdue' },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              placeholder="Filter by course"
              data={['Computer Science', 'Electronics', 'Mechanical', 'Civil']}
              value={filterCourse}
              onChange={setFilterCourse}
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
                <Table.Th>Course</Table.Th>
                <Table.Th>Total Fees</Table.Th>
                <Table.Th>Paid</Table.Th>
                <Table.Th>Pending</Table.Th>
                <Table.Th>Due Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredRecords.map((record) => (
                <Table.Tr key={record.id}>
                  <Table.Td>{record.student_id}</Table.Td>
                  <Table.Td>{record.student_name}</Table.Td>
                  <Table.Td>{record.course}</Table.Td>
                  <Table.Td>₹{record.total_fees.toLocaleString()}</Table.Td>
                  <Table.Td>₹{record.paid_amount.toLocaleString()}</Table.Td>
                  <Table.Td>₹{record.pending_amount.toLocaleString()}</Table.Td>
                  <Table.Td>
                    {record.due_date.toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(record.status)} variant="light">
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSelectedStudent(record)
                          fetchPaymentHistory(record.student_id)
                          setViewModalOpened(true)
                        }}
                      >
                        <IconReceipt size={16} />
                      </ActionIcon>
                      {record.status !== 'paid' && (
                        <ActionIcon
                          variant="subtle"
                          color="green"
                          onClick={() => {
                            setSelectedStudent(record)
                            setPaymentModalOpened(true)
                          }}
                        >
                          <IconCreditCard size={16} />
                        </ActionIcon>
                      )}
                      <ActionIcon variant="subtle">
                        <IconPrinter size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Payment Modal */}
      <Modal
        opened={paymentModalOpened}
        onClose={() => setPaymentModalOpened(false)}
        title="Process Payment"
        size="md"
      >
        {selectedStudent && (
          <Stack>
            <Alert icon={<IconAlertCircle size={16} />} color="blue">
              Processing payment for {selectedStudent.student_name}
            </Alert>
            
            <Text size="sm">
              Total Fees: ₹{selectedStudent.total_fees.toLocaleString()}
            </Text>
            <Text size="sm">
              Paid Amount: ₹{selectedStudent.paid_amount.toLocaleString()}
            </Text>
            <Text size="sm" fw={600}>
              Pending Amount: ₹{selectedStudent.pending_amount.toLocaleString()}
            </Text>

            <NumberInput
              label="Payment Amount"
              placeholder="Enter amount"
              leftSection="₹"
              thousandSeparator=","
              max={selectedStudent.pending_amount}
              required
            />

            <Select
              label="Payment Mode"
              placeholder="Select payment mode"
              data={[
                'Online Transfer',
                'Credit Card',
                'Debit Card',
                'Cash',
                'Cheque',
                'DD',
              ]}
              required
            />

            <TextInput
              label="Transaction ID"
              placeholder="Enter transaction ID"
              required
            />

            <DatePickerInput
              label="Payment Date"
              placeholder="Select date"
              value={new Date()}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setPaymentModalOpened(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayment}>
                Process Payment
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* View Payment History Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title="Payment History"
        size="lg"
      >
        {selectedStudent && (
          <Stack>
            <Group justify="space-between">
              <Text fw={600}>{selectedStudent.student_name}</Text>
              <Badge color={getStatusColor(selectedStudent.status)} variant="light">
                {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
              </Badge>
            </Group>

            <Progress
              value={(selectedStudent.paid_amount / selectedStudent.total_fees) * 100}
              label={`${Math.round((selectedStudent.paid_amount / selectedStudent.total_fees) * 100)}%`}
              size="xl"
              radius="xl"
            />

            <Timeline active={paymentHistory.length - 1} bulletSize={24} lineWidth={2}>
              {paymentHistory.map((payment, index) => (
                <Timeline.Item
                  key={payment.id}
                  bullet={<IconCash size={12} />}
                  title={`₹${payment.amount.toLocaleString()}`}
                >
                  <Text color="dimmed" size="sm">
                    {payment.date.toLocaleDateString()} - {payment.mode}
                  </Text>
                  <Text color="dimmed" size="xs">
                    Transaction ID: {payment.transaction_id}
                  </Text>
                  <Text color="dimmed" size="xs">
                    Receipt No: {payment.receipt_no}
                  </Text>
                </Timeline.Item>
              ))}
            </Timeline>

            <Group justify="flex-end" mt="md">
              <Button variant="light" leftSection={<IconPrinter size={16} />}>
                Print Statement
              </Button>
              <Button onClick={() => setViewModalOpened(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  )
}