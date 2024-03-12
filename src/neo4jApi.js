require('file-loader?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
const Species = require('./models/Species');
const _ = require('lodash');

const neo4j = window.neo4j;
const neo4jUri = process.env.NEO4J_URI;
let neo4jVersion = process.env.NEO4J_VERSION;
if (neo4jVersion === '') {
  // assume Neo4j 4 by default
  neo4jVersion = '4';
}
let database = process.env.NEO4J_DATABASE;
if (!neo4jVersion.startsWith("4")) {
  database = null;
}
const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
);

console.log(`Database running at ${neo4jUri}`)

function searchSpecies(name) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run('MATCH (species:Species)-->(genus:Genus)\
      WHERE toLower(species.name) CONTAINS toLower($name) \
      WITH species as sp, genus.name as genus\
      MATCH (sp)-->(family:Family), (sp)-->(order:Order), (sp)-->(class:Class)\
      OPTIONAL MATCH (sp)-->(phylum:Phylum), (sp)-->(domain:Domain) \
      RETURN sp.name as species, genus, family.name as family, order.name as order, class.name as class, phylum.name as phylum, domain.name as domain\
      LIMIT 5', {name})
    )
    .then(result => {
      return result.records.map(record => {
        return new Species(record.get('species'), record.get('genus'), record.get('family'), record.get('order'), record.get('class'), record.get('domain'));

      });
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getRelatives(species, weight) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
      tx.run("MATCH (:Species {name:$species})-[r1]->()<-[r2]-(relatedSpecies)\
      WHERE r1.weight = $weight AND r2.weight = $weight\
      RETURN relatedSpecies.name AS relatedSpecies\
      LIMIT 10", {species, weight}))
    .then(result => {

      if (_.isEmpty(result.records))
        return null;

      return result.records.map(sp => sp.get('relatedSpecies'));
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

function getGraph(name) {
  const session = driver.session({database: database});
  return session.readTransaction((tx) =>
    tx.run('MATCH (species:Species)-[rl]->(category) \
    WHERE toLower(species.name) CONTAINS toLower($name) \
    RETURN species, rl, category \
    LIMIT $limit', {name, limit: neo4j.int(100)}))
    .then(results => {
      const nodes = [], rels = [];
      let i = 0;
      results.records.forEach(res => {
        let speciesIndex =_.findIndex(nodes, {name: res.get('species').properties.name, label: 'Species'});
        let categoryIndex = _.findIndex(nodes, {name: res.get('category').properties.name, label: res.get('category')['labels'][0]});
        if(speciesIndex === -1) {
          nodes.push({name: res.get('species').properties.name, label: 'Species'});
          speciesIndex = _.findIndex(nodes, {name: res.get('species').properties.name, label: 'Species'});
        }
        if (categoryIndex === -1) {
          nodes.push({name: res.get('category').properties.name, label: res.get('category')['labels'][0]});
          categoryIndex = _.findIndex(nodes, {name: res.get('category').properties.name, label: res.get('category')['labels'][0]});
        }

        rels.push({source: speciesIndex, target: categoryIndex});
      });

      return {nodes, links: rels};
    })
    .catch(error => {
      throw error;
    })
    .finally(() => {
      return session.close();
    });
}

exports.searchSpecies = searchSpecies;
exports.getRelatives = getRelatives;
exports.getGraph = getGraph;
