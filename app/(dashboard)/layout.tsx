'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AppShell, Burger, Group, NavLink, Text, Avatar, Menu, rem, useMantineColorScheme, ActionIcon } from '@mantine/core'
import { createClient } from '@/lib/supabase/client'
import { 
  IconDashboard, 
  IconUsers, 
  IconSchool, 
  IconBook, 
  IconClipboardCheck, 
  IconFileText, 
  IconCash, 
  IconTicket, 
  IconBuilding, 
  IconBooks, 
  IconChartBar,
  IconLogout,
  IconUser,
  IconSettings,
  IconSun,
  IconMoon
} from '@tabler/icons-react'

const navigation = [
  { label: 'Dashboard', href: '/dashboard', icon: IconDashboard },
  { label: 'Students', href: '/students', icon: IconUsers, roles: ['admin', 'faculty'] },
  { label: 'Faculty', href: '/faculty', icon: IconSchool, roles: ['admin'] },
  { label: 'Courses', href: '/courses', icon: IconBook, roles: ['admin', 'faculty', 'student'] },
  { label: 'Attendance', href: '/attendance', icon: IconClipboardCheck, roles: ['admin', 'faculty', 'student'] },
  { label: 'Examinations', href: '/examinations', icon: IconFileText, roles: ['admin', 'faculty', 'student'] },
  { label: 'Fees', href: '/fees', icon: IconCash, roles: ['admin', 'faculty', 'student', 'parent'] },
  { label: 'Out Pass', href: '/outpass', icon: IconTicket, roles: ['admin', 'faculty', 'student'] },
  { label: 'Hostel', href: '/hostel', icon: IconBuilding, roles: ['admin', 'faculty', 'student'] },
  { label: 'Library', href: '/library', icon: IconBooks, roles: ['admin', 'faculty', 'student'] },
  { label: 'Analytics', href: '/analytics', icon: IconChartBar, roles: ['admin'] },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [opened, setOpened] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('student')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Get user role from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
        
      if (error) {
        console.error('Error fetching user role:', error)
        // Default to student if error
        setUserRole('student')
      } else if (userData) {
        console.log('User role:', userData.role)
        setUserRole(userData.role)
      }
    }
    
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened(!opened)}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="xl" fw={700}>University Hub</Text>
          </Group>
          
          <Group>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={() => toggleColorScheme()}
            >
              {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
            
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Avatar 
                  src={user?.user_metadata?.avatar_url} 
                  alt={user?.email} 
                  radius="xl" 
                  size="md"
                  className="cursor-pointer"
                >
                  {user?.email?.charAt(0).toUpperCase()}
                </Avatar>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item 
                  leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => router.push('/dashboard/profile')}
                >
                  Profile
                </Menu.Item>
                <Menu.Item 
                  leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      
      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={20} />}
                active={pathname === item.href}
                className="mb-2 rounded-lg"
              />
            )
          })}
        </AppShell.Section>
      </AppShell.Navbar>
      
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  )
}