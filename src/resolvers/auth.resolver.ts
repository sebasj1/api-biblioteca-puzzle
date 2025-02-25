import { IsEmail, IsNumber, isString, IsString, Length } from 'class-validator'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql'
import { getRepository, Repository } from 'typeorm'
import { User } from '../entity/user.entity'
import { sign } from 'jsonwebtoken'
import { environment } from '../config/environment'
import { IContext } from '../middleware/auth.middleware'

@InputType()
class UserInput {
  @Field()
  @IsString()
  @Length(3, 64)
  fullName!: string

  @Field()
  @IsEmail()
  email!: string

  @Field()
  @IsString()
  @Length(8, 64)
  password!: string
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email!: string

  @Field()
  password!: string
}
@ObjectType()
class LoginResponse {
  @IsNumber()
  @Field()
  userId!: Number

  @Field()
  jwt!: string //Token
}
@Resolver()
export class AuthResolver {
  userRepository: Repository<User>

  constructor() {
    this.userRepository = getRepository('User')
  }

  @Mutation(() => User)
  async Register(@Arg('input') input: UserInput): Promise<User | undefined> {
    try {
      const { fullName, email, password } = input
      const userExist = await this.userRepository.findOne({ where: { email } })
      if (userExist) {
        const error = new Error('Email is not available')
        throw error
      }
      const bcrypt = require('bcrypt')
      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = await this.userRepository.insert({
        fullName,
        email,
        password: hashedPassword,
      })
      return this.userRepository.findOne(newUser.identifiers[0].id)
    } catch (e) {
      throw e
    }
  }

  @Mutation(() => LoginResponse)
  async login(@Arg('input', () => LoginInput) input: LoginInput){
    try {
     
      const { email, password } = input
      const userFound = await this.userRepository.findOne({ where: { email } })
      if (!userFound) {
        const error = new Error('Invalid credentials')
        throw error
      }
      const bcrypt = require('bcrypt')
      const isValidPasswd: boolean = bcrypt.compareSync(
        password,
        userFound.password,
      )
      if (!isValidPasswd) {
        const error = new Error('Invalid credentials')
        throw error
      }
      const jwt: string = sign({ id: userFound.id }, environment.JWT_SECRET)
      return { userId: userFound.id, jwt: jwt }
    } catch (error) {
      throw error
    }
  }
}
