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
  Tabs,
  NumberInput,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { createClient } from '@/lib/supabase/client'
import {
  IconSearch,
  IconBook,
  IconUsers,
  IconClock,
  IconAlertCircle,
  IconPlus,
  IconEye,
  IconRefresh,
  IconDownload,
} from '@tabler/icons-react'

interface Book {
  id: string
  title: string
  authors: string[]
  isbn: string
  category: string
  total_copies: number
  available_copies: number
  location: string
  publication_year: number
}

interface Transaction {
  id: string
  book_title: string
  student_name: string
  student_id: string
  issue_date: Date
  due_date: Date
  return_date: Date | null
  status: 'active' | 'returned' | 'overdue'
  fine_amount: number
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<string | null>('books')
  const [books, setBooks] = useState<Book[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [addBookModalOpened, setAddBookModalOpened] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchBooks()
    fetchTransactions()
  }, [])

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setBooks(data || [])
    } catch (error: any) {
      console.error('Error fetching books:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to fetch books',
        color: 'red',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('library_transactions')
        .select(`
          id,
          issue_date,
          due_date,
          return_date,
          fine_amount,
          library_books (
            title
          ),
          students (
            student_id,
            users (
              full_name
            )
          )
        `)
        .order('issue_date', { ascending: false })

      if (error) throw error

      // Transform the data to match our interface
      const transformedTransactions: Transaction[] = data?.map((transaction: any) => {
        const now = new Date()
        const dueDate = new Date(transaction.due_date)
        const isOverdue = !transaction.return_date && now > dueDate
        
        return {
          id: transaction.id,
          book_title: transaction.library_books?.title || '',
          student_name: transaction.students?.users?.full_name || '',
          student_id: transaction.students?.student_id || '',
          issue_date: new Date(transaction.issue_date),
          due_date: dueDate,
          return_date: transaction.return_date ? new Date(transaction.return_date) : null,
          status: transaction.return_date ? 'returned' : (isOverdue ? 'overdue' : 'active'),
          fine_amount: transaction.fine_amount || 0,
        }
      }) || []

      setTransactions(transformedTransactions)
    } catch (error: any) {
      console.error('Error fetching transactions:', error)
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to fetch transactions',
        color: 'red',
      })
    }
  }

  const stats = {
    totalBooks: books.reduce((sum, b) => sum + b.total_copies, 0),
    availableBooks: books.reduce((sum, b) => sum + b.available_copies, 0),
    issuedBooks: books.reduce((sum, b) => sum + (b.total_copies - b.available_copies), 0),
    overdueBooks: transactions.filter(t => t.status === 'overdue').length,
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Library Management</Title>
        <Group>
          <Button leftSection={<IconDownload size={16} />} variant="light">
            Export Report
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setAddBookModalOpened(true)}>
            Add Book
          </Button>
        </Group>
      </Group>

      <Grid gutter="lg" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Total Books
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalBooks}
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
                  Available
                </Text>
                <Text size="xl" fw={700} color="green">
                  {stats.availableBooks}
                </Text>
              </div>
              <IconBook size={30} color="green" />
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="sm" color="dimmed" tt="uppercase" fw={700}>
                  Issued
                </Text>
                <Text size="xl" fw={700} color="blue">
                  {stats.issuedBooks}
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
                  Overdue
                </Text>
                <Text size="xl" fw={700} color="red">
                  {stats.overdueBooks}
                </Text>
              </div>
              <IconAlertCircle size={30} color="red" />
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="books" leftSection={<IconBook size={16} />}>
              Books Catalog
            </Tabs.Tab>
            <Tabs.Tab value="transactions" leftSection={<IconClock size={16} />}>
              Issue/Return
            </Tabs.Tab>
            <Tabs.Tab value="overdue" leftSection={<IconAlertCircle size={16} />}>
              Overdue Books
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="books" pt="xs">
            <div className="p-4">
              <Grid mb="md">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    placeholder="Search by title, author, or ISBN..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    placeholder="Filter by category"
                    data={['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'General']}
                    value={filterCategory}
                    onChange={setFilterCategory}
                    clearable
                  />
                </Grid.Col>
              </Grid>

              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Title</Table.Th>
                      <Table.Th>Authors</Table.Th>
                      <Table.Th>ISBN</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Location</Table.Th>
                      <Table.Th>Availability</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {books
                      .filter((book) => {
                        const matchesSearch = 
                          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          book.isbn.includes(searchQuery)
                        const matchesCategory = !filterCategory || book.category === filterCategory
                        return matchesSearch && matchesCategory
                      })
                      .map((book) => (
                        <Table.Tr key={book.id}>
                          <Table.Td>
                            <Text size="sm" fw={500}>{book.title}</Text>
                            <Text size="xs" color="dimmed">Year: {book.publication_year}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{book.authors.join(', ')}</Text>
                          </Table.Td>
                          <Table.Td>{book.isbn}</Table.Td>
                          <Table.Td>
                            <Badge variant="light">
                              {book.category}
                            </Badge>
                          </Table.Td>
                          <Table.Td>{book.location}</Table.Td>
                          <Table.Td>
                            <Text size="sm" color={book.available_copies > 0 ? 'green' : 'red'}>
                              {book.available_copies}/{book.total_copies}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <ActionIcon variant="subtle">
                                <IconEye size={16} />
                              </ActionIcon>
                              {book.available_copies > 0 && (
                                <Button size="xs" variant="light">
                                  Issue
                                </Button>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="transactions" pt="xs">
            <div className="p-4">
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Book Title</Table.Th>
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Issue Date</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Fine</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {transactions
                      .filter(t => t.status !== 'returned')
                      .map((transaction) => (
                        <Table.Tr key={transaction.id}>
                          <Table.Td>{transaction.book_title}</Table.Td>
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar size="sm" radius="xl">
                                {transaction.student_name.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <div>
                                <Text size="sm">{transaction.student_name}</Text>
                                <Text size="xs" color="dimmed">{transaction.student_id}</Text>
                              </div>
                            </Group>
                          </Table.Td>
                          <Table.Td>{transaction.issue_date.toLocaleDateString()}</Table.Td>
                          <Table.Td>{transaction.due_date.toLocaleDateString()}</Table.Td>
                          <Table.Td>
                            <Badge
                              color={transaction.status === 'active' ? 'green' : 'red'}
                              variant="light"
                            >
                              {transaction.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {transaction.fine_amount > 0 && (
                              <Text color="red" size="sm">
                                ₹{transaction.fine_amount}
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Button size="xs" variant="light">
                                Return
                              </Button>
                              <ActionIcon variant="subtle">
                                <IconRefresh size={16} />
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

          <Tabs.Panel value="overdue" pt="xs">
            <div className="p-4">
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Book Title</Table.Th>
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Due Date</Table.Th>
                      <Table.Th>Days Overdue</Table.Th>
                      <Table.Th>Fine Amount</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {transactions
                      .filter(t => t.status === 'overdue')
                      .map((transaction) => {
                        const daysOverdue = Math.floor(
                          (new Date().getTime() - transaction.due_date.getTime()) / (1000 * 3600 * 24)
                        )
                        return (
                          <Table.Tr key={transaction.id}>
                            <Table.Td>{transaction.book_title}</Table.Td>
                            <Table.Td>
                              <Group gap="sm">
                                <Avatar size="sm" radius="xl">
                                  {transaction.student_name.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <div>
                                  <Text size="sm">{transaction.student_name}</Text>
                                  <Text size="xs" color="dimmed">{transaction.student_id}</Text>
                                </div>
                              </Group>
                            </Table.Td>
                            <Table.Td>{transaction.due_date.toLocaleDateString()}</Table.Td>
                            <Table.Td>
                              <Text color="red" fw={600}>
                                {daysOverdue} days
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text color="red" fw={600}>
                                ₹{transaction.fine_amount}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Button size="xs" color="red" variant="light">
                                Send Reminder
                              </Button>
                            </Table.Td>
                          </Table.Tr>
                        )
                      })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Add Book Modal */}
      <Modal
        opened={addBookModalOpened}
        onClose={() => setAddBookModalOpened(false)}
        title="Add New Book"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.currentTarget)
          
          try {
            const bookData = {
              title: formData.get('title') as string,
              authors: formData.get('authors')?.toString().split(',').map(a => a.trim()) || [],
              isbn: formData.get('isbn') as string,
              category: formData.get('category') as string,
              total_copies: Number(formData.get('total_copies')),
              available_copies: Number(formData.get('total_copies')), // Initially all copies are available
              location: formData.get('location') as string,
              publication_year: Number(formData.get('publication_year')),
            }
            
            // Save to Supabase
            const { data, error } = await supabase
              .from('library_books')
              .insert(bookData)
              .select()
              .single()
            
            if (error) throw error
            
            // Refresh the books list
            await fetchBooks()
            setAddBookModalOpened(false)
            
            notifications.show({
              title: 'Success',
              message: 'Book added successfully!',
              color: 'green',
            })
          } catch (error: any) {
            console.error('Error adding book:', error)
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to add book',
              color: 'red',
            })
          }
        }}>
          <Stack>
            <TextInput
              label="Book Title"
              placeholder="Enter book title"
              name="title"
              required
            />
            <TextInput
              label="Authors"
              placeholder="Enter authors (comma separated)"
              name="authors"
              required
            />
            <TextInput
              label="ISBN"
              placeholder="Enter ISBN"
              name="isbn"
              required
            />
            <Select
              label="Category"
              placeholder="Select category"
              name="category"
              data={['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'General']}
              required
            />
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Total Copies"
                  placeholder="Enter number of copies"
                  name="total_copies"
                  min={1}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Publication Year"
                  placeholder="Enter publication year"
                  name="publication_year"
                  min={1900}
                  max={new Date().getFullYear()}
                  required
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Location"
              placeholder="Enter shelf location (e.g., CS-101)"
              name="location"
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setAddBookModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Book
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  )
}