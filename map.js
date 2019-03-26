
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var color = d3.scaleThreshold()
    .domain(d3.range(100000, 1000000, 100000))
    .range(colorbrewer.Reds[9]);
// http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson
d3.json("nyc.json", function(error, nyc) {

	d3.csv("NY_neighborhoods_zillow_index.csv",function(error, pricedata){
if (error) throw error;

var priceByName = {}

pricedata.forEach(function(d){
	priceByName[d.region_name] = + d.zindex;
});

console.log(priceByName);

var path = d3.geoPath()
  .projection(d3.geoConicConformal()
  .parallels([33, 45])
  .rotate([96, -39])
  .fitSize([width, height], nyc));

svg.selectAll("path")
  .data(nyc.features)
  .enter().append("path")
  .attr("d", path)
.style("fill", function(d){
	console.log(d.properties.neighborhood);
	console.log(priceByName[d.properties.neighborhood]);
	return color(priceByName[d.properties.neighborhood]);
})
  .on("mouseenter", function(d) {
  d3.select(this)
  .style("stroke-width", 1.5)
	  .style("stroke-dasharray", 0);

  d3.select("#neighborhood")
  .transition()
  .style("opacity", 1)
  .style("left", (d3.event.pageX) + "px")
  .style("top", (d3.event.pageY) + "px")
  .text(d.properties.neighborhood + "; Zindex: "+ priceByName[d.properties.neighborhood])

})
.on("mouseleave", function(d) {
  d3.select(this)
  .style("stroke-width", .25)
  .style("stroke-dasharray", 1)

  d3.select("#neighborhoodText")
  .transition()
  .style("opacity", 0);
});

});
});