import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";

const typeDefs = `#graphql
  type Species {
    name: String
    
    domain: [Domain!]! @relationship(type: "of_domain", direction: OUT, properties: "link")
    phylum: [Phylum!]! @relationship(type: "of_phylum", direction: OUT, properties: "link")
    class: [Class!]! @relationship(type: "of_class", direction: OUT, properties: "link")
    order: [Order!]! @relationship(type: "of_order", direction: OUT, properties: "link")
    family: [Family!]! @relationship(type: "of_family", direction: OUT, properties: "link")
    genus: [Genus!]! @relationship(type: "of_genus", direction: OUT, properties: "link")
  }
  
  type Domain {
    name: String
    species: [Species!]! @relationship(type: "of_domain", direction: IN, properties: "link")
  }
  
  type Phylum {
    name: String
    species: [Species!]! @relationship(type: "of_phylum", direction: IN, properties: "link")
  }
  
  type Class {
    name: String
    consists_of: [Species!]! @relationship(type: "of_class", direction: IN, properties: "link")
  }
  
  type Order {
    name: String
    consists_of: [Species!]! @relationship(type: "of_order", direction: IN, properties: "link")
  }
  
  type Family {
    name: String
    consists_of: [Species!]! @relationship(type: "of_family", direction: IN, properties: "link")
  }
  
  type Genus {
    name: String
    consists_of: [Species!]! @relationship(type: "of_genus", direction: IN, properties: "link")
  }
  
  type link @relationshipProperties {
    weight: Int
  }

  query findRelatives($name: String) {
    species(where: {family: {consists_of: {name: $name}}}) {
      name
      family {
        name
      }
      familyConnection {
        edges {
          properties {
            weight
          }
        }
      }
    }
  }
  query getSpeciesList($options: SpeciesOptions) {
    species(options: $options) {
      name
    }
  }
`;

const driver = neo4j.driver(
    "<db-url>",
    neo4j.auth.basic("<username>", "<passwd>")
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀 Server ready at ${url}`);