import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import { Book } from './book.entity'
import { Field, ObjectType } from 'type-graphql' //objectType es para cuando queremos devolver un objeto complejp

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn() //Decorador para incrementar id
  @Field() //Cada campo debe indicarse asi
  id!: number

  @Field(() => String)
  @Column()
  fullName!: string

  @Field(() => String)
  @Column()
  email!: string

  @Field(() => String)
  @Column()
  password!: string

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: string
} 
