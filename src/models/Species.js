// const _ = require('lodash');

function Species(species, genus, family, order, clas, phylum, domain) {
  // _.extend(this, _node.properties);

  this.species = species;
  this.genus = genus;
  this.family = family;
  this.order = order;
  this.clas = clas;
  this.phylum = phylum;
  this.domain = domain;
}

module.exports = Species;
