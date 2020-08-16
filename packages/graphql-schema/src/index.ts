import gql from 'graphql-tag';
import { makeExecutableSchema } from 'graphql-tools';

export const typeDefs = gql`
  interface Node {
    id: ID!
  }

  interface LivingThing {
    id: ID!
    name: String!
    # days
    lifespan: Int!
    eatenBy: [LivingThing]!
    # pounds
    weight: Float!
  }

  type Animal implements LivingThing {
    id: ID!
    name: String!
    lifespan: Int!
    eatenBy: [LivingThing]!
    diet: [LivingThing]!
    weight: Float!
  }

  enum PlantLifecycle {
    EVERGREEN
    DECIDUOUS
    SEMI_DECIDUOUS
  }

  type Plant implements Node & LivingThing {
    id: ID!
    name: String!
    lifespan: Int!
    eatenBy: [LivingThing]!
    lifecycle: PlantLifecycle!
    weight: Float!
  }

  type Error {
    path: [String!]!
    code: String!
  }

  type InputError {
    errors: [Error!]!
  }

  input AnimalInput {
    name: String!
    lifespan: Int!
    eatenBy: [ID]!
    diet: [ID!]!
    weight: Float!
  }

  input PlantInput {
    name: String!
    lifespan: Int!
    lifecycle: PlantLifecycle!
    weight: Float!
    eatenBy: [ID!]!
  }

  # input interfaces don't exist, so approximate by this with checks in code
  input LivingThingInput {
    animal: AnimalInput
    plant: PlantInput
  }

  input AddLivingThingInput {
    livingThing: LivingThingInput!
  }

  type AddLivingThingPayload {
    node: LivingThing
  }

  input AnimalPatchInput {
    name: String
    lifespan: Int
    diet: [ID!]
  }

  input PlantPatchInput {
    name: String
    lifespan: Int
    lifecycle: PlantLifecycle
    weight: Float
  }

  input LivingThingPatchInput {
    animal: AnimalPatchInput
    plant: PlantPatchInput
  }

  input UpdateLivingThingInput {
    patch: LivingThingPatchInput!
  }

  type UpdateLivingThingPayload {
    node: LivingThing
  }

  input DeleteLivingThingInput {
    id: ID!
  }

  type DeleteLivingThingPayload {
    success: Boolean!
  }

  type LivingThingPayload {
    node: LivingThing
  }

  union LivingThingResult = LivingThingPayload | InputError

  input AllLivingThingsInput {
    page: Int!
  }

  type AllLivingThingsPayload {
    nodes: [LivingThing!]!
    hasNextPage: Boolean!
  }

  union AllLivingThingsResult = AllLivingThingsPayload | InputError

  type Query {
    node(id: ID!): Node
    livingThing(id: ID!): LivingThingResult!
    allLivingThings(input: AllLivingThingsInput!): AllLivingThingsResult!
  }

  union AddLivingThingResult = AddLivingThingPayload | InputError
  union UpdateLivingThingResult = UpdateLivingThingPayload | InputError
  union DeleteLivingThingResult = DeleteLivingThingPayload | InputError

  type Mutation {
    addLivingThing(input: AddLivingThingInput!): AddLivingThingResult!
    updateLivingThing(input: UpdateLivingThingInput!): UpdateLivingThingResult!
    deleteLivingThing(input: DeleteLivingThingInput!): DeleteLivingThingResult!
  }
`;

export default makeExecutableSchema({
  typeDefs,
});
