import 'reflect-metadata' //necesita para los decoradores
import { ApolloServer } from 'apollo-server-express' //crea una ruta al servidor para conectar a api de graphql
import { buildSchema } from 'type-graphql' //buildSchema convierte de lenguaje ty o js a graphql
import { BookResolver } from './resolvers/book.resolvers' //donde estan los resolvers
import { AuthorResolver } from './resolvers/author.resolvers'
import { AuthResolver } from './resolvers/auth.resolver'
//funcion encargada de crear el servidor
export async function startServer() {
  const express = require('express')

  const app = express()

  const apolloServer = new ApolloServer({
    // Construye el esquema de GraphQL utilizando los resolvers
    schema: await buildSchema({
      resolvers: [BookResolver, AuthorResolver, AuthResolver],
    }), // Aquí agregamos nuestros resolvers
    context: ({ req, res }) => ({ req, res }),
  }) //buildSchema convierte de lenguaje ty o js a graphql

  apolloServer.applyMiddleware({ app, path: '/graphql' })
  return app
}
