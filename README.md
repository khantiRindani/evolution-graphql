## Description:

This repo contains web-apps over Evolution Graph Dataset offering capabilities to realize similarity and origins between species. 

Evolution of Species - studied by Darwin follows connected graph structure. Here, we've built the dataset on Neo4j using Species as nodes and Category linkage as relationships. For user ease, a JS/SCSS/bootstrap dashboard app is built over neo4j dataset. Also,
graphql API server is setup for API support.

## Demo:

### UI Dashboard:
https://github.com/khantiRindani/evolution-graphql/assets/36477517/c89f8377-05c3-4c07-b52b-9a73485853f1

## Spec:

### Database:
- *Data Source:* https://gtdb.ecogenomic.org
- *Representation:* Evolution is normally described as [Phylogenetic tree](http://phylot.biobyte.de). For tabular representation, taxonomy is created.
Our graph is generated using tabular representation.
- *Size:* 85205 species * 6 levels of categorization resulting into 113k nodes and 400k edges
- *Model:*
  
  <img width="400" alt="Graph Model" src="https://github.com/khantiRindani/evolution-graphql/assets/36477517/f7024ea5-8ba0-449a-83ad-57d3eee0a4ba">
- *Example Instance:*
  
  <img width="500" alt="Example Instance" src="https://github.com/khantiRindani/evolution-graphql/assets/36477517/c99a00e5-712e-4ad5-b462-7896416862ef">


### UI dashboard:
- Scripting: JS
- Graph Visualization: d3js
- Neo4j connector: neo4j-driver library
- Styling: SCSS, Bootstrap
- Package: npm
- Build: webpack

### API server:
- API kind: GraphQL (native graph model)
- API schema: Type definition in GraphQL query, Resolver Auto-setup + type extension through neo4j/graphql library
- Server: Apollo Server
- Package: npm