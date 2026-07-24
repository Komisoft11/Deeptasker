interface User {
  id: number
  email: string
  username: string
  firstName: string
  lastName: string
  dateCreated: Date
}

interface StatusChange {
  old: string | null
  new: string
}

interface AssigneeChange {
  old: User | null
  new: User
}

interface DeadlineChange {
  old: string | null
  new: string
}

interface TagsChange {
  old: string[]
  new: string[]
}

interface TaskAction {
  user: User
  date: Date
  assignee?: AssigneeChange
  status?: StatusChange
  comment?: string
  deadline?: DeadlineChange
  tags?: TagsChange
}

export const taskActions: TaskAction[] = [
  {
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      dateCreated: new Date()
    },
    date: new Date(),
    deadline: {
      old: null,
      new: 'October 25, 2024'
    },
    status: {
      old: null,
      new: 'Open'
    }
  },
  {
    user: {
      id: 2,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      dateCreated: new Date()
    },
    assignee: {
      old: null,
      new: {
        id: 1,
        email: 'test@test.com',
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        dateCreated: new Date()
      }
    },
    date: new Date(),
    status: {
      old: null,
      new: 'In Progress'
    }
  },
  {
    user: {
      id: 2,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      dateCreated: new Date()
    },
    assignee: {
      old: {
        id: 2,
        email: 'test@test.com',
        username: 'test@test.com',
        firstName: 'Jane',
        lastName: 'Smith',
        dateCreated: new Date()
      },
      new: {
        id: 1,
        email: 'test@test.com',
        username: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        dateCreated: new Date()
      }
    },
    date: new Date(),
    status: {
      old: null,
      new: 'In Progress'
    }
  },
  {
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      dateCreated: new Date()
    },
    status: {
      old: 'Open',
      new: 'In Review'
    },
    date: new Date()
  },
  {
    user: {
      id: 2,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      dateCreated: new Date()
    },
    comment: 'Please review the financial section.',
    date: new Date()
  },
  {
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      dateCreated: new Date()
    },
    deadline: {
      old: 'October 20, 2024',
      new: 'October 25, 2024'
    },
    date: new Date()
  },
  {
    user: {
      id: 1,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'John',
      lastName: 'Doe',
      dateCreated: new Date()
    },
    tags: {
      old: [],
      new: ['Urgent', 'Finance']
    },
    date: new Date()
  },
  {
    user: {
      id: 2,
      email: 'test@test.com',
      username: 'test@test.com',
      firstName: 'Jane',
      lastName: 'Smith',
      dateCreated: new Date()
    },
    status: {
      old: 'In Review',
      new: 'Closed'
    },
    date: new Date()
  }
]
