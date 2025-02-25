import { Mutation, Query, Resolver, Arg, InputType, Field } from 'type-graphql'
import { Author } from '../entity/author.entity'
import { getRepository, QueryBuilder, Repository } from 'typeorm' //getRepository es una forma de
import { isNumber, IsNumber, IsString, Length } from 'class-validator'
import { error } from 'console'
// obtener el repositorio de una entidad. El repositorio es una interfaz que proporciona
// una serie de métodos para interactuar con la base de datos, como hacer operaciones CRUD
//  (Crear, Leer, Actualizar, Eliminar), buscar registros, realizar consultas avanzadas,
// y mucho más.
//En type-graphql, el decorador @Arg se utiliza para definir los argumentos que se pasan
// a una función o resolver dentro de un esquema GraphQL. Se emplea para especificar un
// argumento dentro de una consulta o mutación que un cliente puede enviar al servidor.

@InputType() //Tipo entrada
class AuthorInput {
  @IsString()
  @Field()
  @Length(3, 64)
  fullName!: string
}

@InputType() //Tipo entrada
class AuthorInputId {
  @IsNumber()
  @Field()
  id!: number
}

@InputType()
class AuthorUpdateInput {
  @IsNumber()
  @Field()
  id!: number

  @IsString()
  @Field()
  @Length(3, 64)
  fullName!: string
}

@Resolver()
export class AuthorResolver {
  authorRepository: Repository<Author>

  constructor() {
    this.authorRepository = getRepository(Author)
  }

  @Mutation(() => Author)
  async createAuthor(
    @Arg('input') input: AuthorInput,
  ): Promise<Author | undefined> {
    try {
      const createdAuthor = this.authorRepository.create({
        fullName: input.fullName,
      })
      await this.authorRepository.save(createdAuthor)
      const result = await this.authorRepository.findOne(createdAuthor.id)

      return result
    } catch {
      console.error
    }
  }

  @Query(() => [Author]) //vamos a teer un array por eso lo encerramos
  async getAllAuthor(): Promise<Author[]> {
    return await this.authorRepository.find({ relations: ['books'] })
  }

  @Query(() => Author)
  async findOneAuthor(
    @Arg('input', () => AuthorInputId) input: AuthorInputId,
  ): Promise<Author> {
    try {
      const author = await this.authorRepository.findOne(input.id)
      if (!author) {
        const error = new Error()
        error.message = "Author doesn't exists"
        throw error
      }
      return author
    } catch (e) {
      throw e
    }
  }

  @Mutation(() => Author)
  async updateOneAuthor(
    @Arg('input', () => AuthorUpdateInput) input: AuthorUpdateInput,
  ): Promise<Author> {
    const authorExist = await this.authorRepository.findOne(input.id)

    if (!authorExist) {
      throw new Error('Author does not exist')
    }

    return await this.authorRepository.save({
      id: input.id,
      fullName: input.fullName,
    })
  }

  @Mutation(() => Boolean)
  async deleteOneAuthor(
    @Arg('input', () => AuthorInputId) input: AuthorInputId,
  ): Promise<Boolean> {
    try {
      const result = await this.authorRepository.delete(input.id)
      if (result.affected === 0) {
        throw new Error('author does not exist')
      }
      return true
    } catch (error) {
      throw error
    }
  }
}
