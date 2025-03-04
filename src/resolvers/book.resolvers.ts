import {
  Mutation,
  Query,
  Resolver,
  Arg,
  Field,
  InputType,
  UseMiddleware,
  Ctx,
} from 'type-graphql'
import { Book } from '../entity/book.entity'
import { Author } from '../entity/author.entity'
import { getRepository, Repository } from 'typeorm'
import { IsNumber, IsString, Length } from 'class-validator'
import { IContext, isAuth } from '../middleware/auth.middleware'

//Son los inputs que se van a usar para cargar

//Input de un libro
@InputType()
class BookInput {
  @IsString()
  @Field()
  @Length(3, 64)
  title!: string

  @IsNumber()
  @Field()
  author!: number //Recibe un numero
}

//Input de libro pero con autor
@InputType()
class BookInputAuthor {
  @IsString()
  @Field({ nullable: true })
  @Length(3, 64)
  title?: string

  @Field({ nullable: true })
  author?: Author //recibe un Author
}

//Input para id
@InputType()
class BookInputId {
  @IsNumber()
  @Field()
  id!: number
}

@Resolver()
export class BookResolver {
  bookRepository: Repository<Book>
  authorRepository: Repository<Author>
  constructor() {
    this.bookRepository = getRepository(Book)
    this.authorRepository = getRepository(Author)
  }

  @Mutation(() => Book)
  @UseMiddleware(isAuth) //verifica primero que este autorizado
  async createBook(
    @Arg('input', () => BookInput) input: BookInput,
    @Ctx() context: IContext,
  ) {
    try {
      const author: Author | undefined = await this.authorRepository.findOne(
        input.author,
      )
      if (!author) {
        const error = new Error()
        error.message = "The author doesn't exist"
        throw error
      }
      const book = this.bookRepository.create({
        title: input.title,
        author: author,
      })
      await this.bookRepository.save(book)
      return await this.bookRepository.findOne(book.id, {
        relations: ['author'],
      })
    } catch (e) {
      throw e
    }
  }

  @Query(() => [Book])
  @UseMiddleware(isAuth) //verifica primero que este autorizado
  async getAllBooks(): Promise<Book[]> {
    return await this.bookRepository.find({ relations: ['author'] })
  }

  @Query(() => Book)
  async getBookById(
    @Arg('input', () => BookInputId) input: BookInputId,
  ): Promise<Book | undefined> {
    try {
      const book = await this.bookRepository.findOne(input.id, {
        relations: ['author'],
      })
      if (!book) {
        throw new Error("Book with that id doesn't exists")
      }
      return book
    } catch (e) {
      throw e
    }
  }

  @Mutation(() => Boolean)
  async updateBookId(
    @Arg('bookId', () => BookInputId) bookId: BookInputId,
    @Arg('input', () => BookInput) input: BookInputAuthor,
  ): Promise<Boolean> {
    try {
      const book = await this.bookRepository.findOne(bookId, {
        relations: ['author'],
      })
      if (!book) {
        throw new Error('Book not found')
      }
      await this.bookRepository.update(
        bookId.id,
        await this.parseInputAuthor(input),
      )

      return true
    } catch (e) {
      throw e
    }
  }

  @Mutation(() => Boolean)
  async deleteBookById(
    @Arg('input', () => BookInputId) input: BookInputId,
  ): Promise<Boolean> {
    try {
      const result=await this.bookRepository.delete(input.id)
      if(result.affected===0){
        throw new Error('Book does not exist')
      }
      return true
    } catch (e) {
      throw e
    }
  }

  private async parseInputAuthor(input: BookInputAuthor) {
    try {
      const _input: BookInputAuthor = {}
      if (input.title) {
        _input['title'] = input.title
      }
      if (input.author) {
        const author = await this.authorRepository.findOne(input.author)
        if (!author) {
          throw new Error('Author not found')
        }
        _input['author'] = author
      }
      return _input
    } catch (e) {
      throw e
    }
  }
}
