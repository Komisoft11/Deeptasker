import { UniqueIdentifier } from '@dnd-kit/core'
import { makeAutoObservable } from 'mobx'


export class Person {
  get isCollapsed(): boolean {
    return this._isCollapsed
  }

  set isCollapsed(value: boolean) {
    this._isCollapsed = value
  }

  get depth(): number {
    return this._depth
  }

  set depth(value: number) {
    this._depth = value
  }

  get parentId(): UniqueIdentifier | undefined {
    return this._parentId
  }

  set parentId(value: UniqueIdentifier | undefined) {
    this._parentId = value
  }

  get children(): Person[] {
    return this._children
  }

  set children(value: Person[]) {
    this._children = value
  }

  get name(): string {
    return this._name
  }

  set name(value: string) {
    this._name = value
  }

  get id(): string {
    return this._id
  }

  set id(value: string) {
    this._id = value
  }

  private _id: string
  private _name: string
  private _children: Person[]
  private _parentId?: UniqueIdentifier
  private _depth: number
  private _isCollapsed: boolean

  constructor(dto: {
    id: string
    name: string
    children: Person[]
    depth: number
    parentId?: UniqueIdentifier
  }) {
    this._id = dto.id
    this._name = dto.name
    this._children = dto.children
    this._parentId = dto.parentId
    this._depth = dto.depth
    this._isCollapsed = true
    makeAutoObservable(this)
  }
}

const person11: Person = new Person({
  id: 'person11',
  name: 'person11',
  depth: 3,
  children: [],
  parentId: 'person7'
})

const person12: Person = new Person({
  id: 'person12',
  name: 'person12',
  depth: 3,
  children: [],
  parentId: 'person8'
})

const person6: Person = new Person({
  id: 'person6',
  name: 'person6',
  depth: 2,
  children: [],
  parentId: 'person1'
})

const person7: Person = new Person({
  id: 'person7',
  name: 'person7',
  depth: 2,
  children: [person11],
  parentId: 'person1'
})
const person8: Person = new Person({
  id: 'person8',
  name: 'person8',
  depth: 2,
  children: [person12],
  parentId: 'person3'
})
const person9: Person = new Person({
  id: 'person9',
  name: 'person9',
  depth: 2,
  children: [],
  parentId: 'person3'
})
const person10: Person = new Person({
  id: 'person10',
  name: 'person10',
  depth: 2,
  children: [],
  parentId: 'person3'
})

const person1: Person = new Person({
  id: 'person1',
  name: 'person1',
  depth: 1,
  children: [person6, person7],
  parentId: undefined
})
const person2: Person = new Person({
  id: 'person2',
  name: 'person2',
  depth: 1,
  children: [],
  parentId: undefined
})
const person3: Person = new Person({
  id: 'person3',
  name: 'person3',
  depth: 1,
  children: [person8, person9, person10],
  parentId: undefined
})
const person4: Person = new Person({
  id: 'person4',
  name: 'person4',
  depth: 1,
  children: [],
  parentId: undefined
})
const person5: Person = new Person({
  id: 'person5',
  name: 'person5',
  depth: 1,
  children: [],
  parentId: undefined
})

export class TestStore {
  private _users: Person[] = [
    person1,
    person2,
    person3,
    person4,
    person5,
    person6,
    person7,
    person8,
    person9,
    person10,
    person11,
    person12
  ]

  get users(): Person[] {
    return this._users
  }

  set users(value: Person[]) {
    this._users = value
  }

  constructor() {
    makeAutoObservable(this)
  }
}
