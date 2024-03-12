const api = require('./neo4jApi');

$(function () {
  search();

  $("#search").submit(e => {
    e.preventDefault();
    search();
  });

  $("#weightSelection").change(e => {
    showRelatives($("td.species")[0].textContent, Number(e.target.value));
  })
});

function showRelatives(species, weight) {
  api
    .getRelatives(species, weight)
    .then(relatedSpecies => {
      if (!relatedSpecies) return;

      $("#toSpecies").val($("td.species")[0].textContent);
      const relatedSpeciesList = $("#relatedSpecies").empty();

      relatedSpecies.forEach(rs => {
        $(`<tr><td>${rs}</td></tr>`)
        .appendTo(relatedSpeciesList)
        .click(function(){
          $("#search").find("input[name=search]").val(rs);
          search();
        })
      })
    }, "json");
}


function search(showFirst = true) {
  const query = $("#search").find("input[name=search]").val();
  renderGraph(query);
  api
    .searchSpecies(query)
    .then(species => {
      const t = $("table#results tbody").empty();

      if (species) {
        species.forEach((sp, index) => {
          $(`<tr class=${index === 0 ? 'table-active': ''}>` + 
              `<td class='species'>${sp.species}</td>` + 
              `<td>${sp.genus}</td>` +
              `<td>${sp.family}</td>` +
              `<td>${sp.order}</td>` +
              `<td>${sp.clas}</td>` +
              `<td>${sp.phylum}</td>` +
              `<td>${sp.domain}</td>` +
            '</tr>')
            .appendTo(t)
            .click(function() {
              $(".table-active").removeClass("table-active");
              showRelatives($(this).find("td.species").text(), Number($("#weightSelection").val()));
              $(this).addClass("table-active");
              $("#toSpecies").val($(this).find("td.species").text());
            })
        });

        const first = species[0];
        if (first && showFirst) {
          return showRelatives(first.species, Number($("#weightSelection").val()));
        }
      }
    });
}

// Reheat the simulation when drag starts, and fix the subject position.
function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

// Update the subject (dragged node) position during drag.
function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

// Restore the target alpha so the simulation cools after dragging ends.
// Unfix the subject position now that it’s no longer being dragged.
function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

function renderGraph(query) {
  const width = 900, height = 400;
  // const force = d3.layout.force()
  //   .charge(-100).linkDistance(15).size([width, height]);
  $("#graph svg").remove();
  
  const svg = d3.select("#graph").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width/2, -height/2, width, height])
    .attr("style", "max-width: 100%; height: auto;")
    .attr("pointer-events", "all");

  api
    .getGraph(query)
    .then(graph => {
      console.log(graph);

      const links = graph.links.map(d => ({...d}));
      const nodes = graph.nodes.map(d => ({...d}));

      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links))
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY());

      // Add a line for each link, and a circle for each node.
      const link = svg.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
          .selectAll("line")
          .data(links)
          .join("line")
          // .attr("stroke-width", d => Math.sqrt(d.weight))
          .attr("class", "link");

      const node = svg.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .selectAll("circle")
          .data(nodes)
          .join("circle")
          .attr("class", d => "node " + d.label)
          .attr("r", d => d.label === "Species" ? 7 : 5);
      console.log(node);

      node.append("title")
          .text(d => `name: ${d.name}, type: ${d.label}`);

      // Add a drag behavior.
      node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
      
      // Set the position attributes of links and nodes each time the simulation ticks.
      simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      });

      console.log(svg);

      // When this cell is re-run, stop the previous simulation. (This doesn’t
      // really matter since the target alpha is zero and the simulation will
      // stop naturally, but it’s a good practice.)
      // invalidation.then(() => simulation.stop());

      console.log(svg);
      return svg.node();
    });
}
