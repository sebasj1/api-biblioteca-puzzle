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
export class Author {
  @PrimaryGeneratedColumn() //Decorador para incrementar id
  @Field() //Cada campo debe indicarse asi
  id!: number

  @Field(() => String)
  @Column()
  fullName!: string

  @Field(()=>[Book],{ nullable: true }) //Porque puede no tener libros
  @OneToMany(() => Book, (book) => book.author, { nullable: true }) //author 1 -- * book
  books!: Book[]|null

  @Field(() => String)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: string
} 
