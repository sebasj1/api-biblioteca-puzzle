import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm'

import { Author } from './author.entity'
import { ObjectType, Field } from 'type-graphql'

@ObjectType()
@Entity()
export class Book {
  @Field()
  @PrimaryGeneratedColumn() //Decoradorpara incrementar id
  id!: number

  @Field()
  @Column()
  title!: string

  @Field(() => Author) 
  @ManyToOne(() => Author, (author) => author.books) //relacion con author,author 1--*book
  author!: Author

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: string
}
