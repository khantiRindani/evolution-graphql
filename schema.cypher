:param {
  // Define the file path root and the individual file names required for loading.
  // https://neo4j.com/docs/operations-manual/current/configuration/file-locations/
  file_path_root: 'file:///', // Change this to the folder your script can access the files at.
  file_0: 'gtdb-taxonomy-table.csv'
};

// CONSTRAINT creation
// -------------------
//
// Create node uniqueness constraints, ensuring no duplicates for the given node label and ID property exist in the database. This also ensures no duplicates are introduced in future.
//
// NOTE: The following constraint creation syntax is generated based on the current connected database version 5.18-aura.
CREATE CONSTRAINT `imp_uniq_Species_name` IF NOT EXISTS
FOR (n: `Species`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Phylum_name` IF NOT EXISTS
FOR (n: `Phylum`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Domain_name` IF NOT EXISTS
FOR (n: `Domain`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Order_name` IF NOT EXISTS
FOR (n: `Order`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Genus_name` IF NOT EXISTS
FOR (n: `Genus`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Class_name` IF NOT EXISTS
FOR (n: `Class`)
REQUIRE (n.`name`) IS UNIQUE;
CREATE CONSTRAINT `imp_uniq_Family_name` IF NOT EXISTS
FOR (n: `Family`)
REQUIRE (n.`name`) IS UNIQUE;

:param {
  idsToSkip: []
};

// NODE load
// ---------
//
// Load nodes in batches, one node label at a time. Nodes will be created using a MERGE statement to ensure a node with the same label and ID property remains unique. Pre-existing nodes found by a MERGE statement will have their other properties set to the latest values encountered in a load file.
//
// NOTE: Any nodes with IDs in the 'idsToSkip' list parameter will not be loaded.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Species` IN $idsToSkip AND NOT row.`Species` IS NULL
CALL {
  WITH row
  MERGE (n: `Species` { `name`: row.`Species` })
  SET n.`name` = row.`Species`
  SET n.`speciesCount` = row.`No. genomes`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Phylum` IN $idsToSkip AND NOT row.`Phylum` IS NULL
CALL {
  WITH row
  MERGE (n: `Phylum` { `name`: row.`Phylum` })
  SET n.`name` = row.`Phylum`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Domain` IN $idsToSkip AND NOT row.`Domain` IS NULL
CALL {
  WITH row
  MERGE (n: `Domain` { `name`: row.`Domain` })
  SET n.`name` = row.`Domain`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Order` IN $idsToSkip AND NOT row.`Order` IS NULL
CALL {
  WITH row
  MERGE (n: `Order` { `name`: row.`Order` })
  SET n.`name` = row.`Order`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Genus` IN $idsToSkip AND NOT row.`Genus` IS NULL
CALL {
  WITH row
  MERGE (n: `Genus` { `name`: row.`Genus` })
  SET n.`name` = row.`Genus`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Class` IN $idsToSkip AND NOT row.`Class` IS NULL
CALL {
  WITH row
  MERGE (n: `Class` { `name`: row.`Class` })
  SET n.`name` = row.`Class`
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row
WHERE NOT row.`Family` IN $idsToSkip AND NOT row.`Family` IS NULL
CALL {
  WITH row
  MERGE (n: `Family` { `name`: row.`Family` })
  SET n.`name` = row.`Family`
} IN TRANSACTIONS OF 10000 ROWS;


// RELATIONSHIP load
// -----------------
//
// Load relationships in batches, one relationship type at a time. Relationships are created using a MERGE statement, meaning only one relationship of a given type will ever be created between a pair of nodes.
LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Phylum` { `name`: row.`Phylum` })
  MERGE (source)-[r: `of_phylum`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Domain` { `name`: row.`Domain` })
  MERGE (source)-[r: `of_domain`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Genus` { `name`: row.`Genus` })
  MERGE (source)-[r: `of_genus`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Family` { `name`: row.`Family` })
  MERGE (source)-[r: `of_family`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Order` { `name`: row.`Order` })
  MERGE (source)-[r: `of_order`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;

LOAD CSV WITH HEADERS FROM ($file_path_root + $file_0) AS row
WITH row 
CALL {
  WITH row
  MATCH (source: `Species` { `name`: row.`Species` })
  MATCH (target: `Class` { `name`: row.`Class` })
  MERGE (source)-[r: `of_class`]->(target)
} IN TRANSACTIONS OF 10000 ROWS;



// Weight Setting
// -----------------
//
// Assign weight to each category relationship. This helps in realizing specification degree and similarity index between two species.

MATCH p=()-[r:of_genus]->()
SET r.weight = 6;
MATCH p=()-[r:of_family]->()
SET r.weight = 5;
MATCH p=()-[r:of_order]->()
SET r.weight = 4;
MATCH p=()-[r:of_class]->()
SET r.weight = 3;
MATCH p=()-[r:of_phylum]->()
SET r.weight = 2;
MATCH p=()-[r:of_domain]->()
SET r.weight = 1;