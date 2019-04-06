
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");

var color = d3.scaleThreshold()
    .domain(d3.range(100000, 1000000, 100000))
    .range(colorbrewer.Greens[9]);

var radius = d3.scaleSqrt()
  .domain([0, 1e6])
  .range([0, 15]);
// http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson

//read in data
queue()
  .defer(d3.json, "nyc.json") // read geo data for nyc
  .defer(d3.csv, "NY_neighborhoods_zillow_index.csv") // read housing data
  .defer(d3.csv,"mock_crime_dataset.csv")
  //TODO read crime data
  .await(ready);

  function ready(error, nyc, pricedata, crime) {
    if (error) throw error;

    var priceByName = {}
    pricedata.forEach(function(d){
      priceByName[d.region_name] = + d.zindex;

    });

    var crimeByName = {}
    crime.forEach(function(d){
      crimeByName[d.region_name] = + d.Crime_Index;
    });

    var formatNum = d3.format(".1");
    var formatRatio = d3.format("%");

    function formatSales(val) {
      var prefix = d3.formatPrefix(val),
          format = d3.format(".1f");
      return format(prefix.scale(val)) + prefix.symbol;
    }

    // var barTooltip = d3.select("body").append("div")
    // .attr("class", "tooltip")
    // .style("opacity", 0)
    // .style("width",600);

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
      // d3.select(this)
      // .style("stroke-width", 1.5)
      //   .style("stroke-dasharray", 0);


      var tip = "<h3>" + d.properties.neighborhood + "</h3>";
      var tip = tip+"<h4>borough:" + d.properties.borough  + "<h4>";
      var tip = tip+"<strong>Price:</strong>" + formatNum(priceByName[d.properties.neighborhood]) + "<br/>";
      var tip = tip+"<strong>Crime:</strong> $" + formatNum(crimeByName[d.properties.neighborhood])+ "<br/>";
      var tip = tip+"<h4>Category : Price</h4>";

      barTooltip = d3.select("#neighborhood")

      barTooltip.transition()
        .style("opacity", 0.7)

      barTooltip.html(tip)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px")

      // .text(d.properties.neighborhood + "; Zindex: "+ priceByName[d.properties.neighborhood])

      // var circleName = d.properties.neighborhood;

      // barTooltip.transition()
      //     .duration(500)
      //     .style("opacity", .7);


      // barTooltip.html(tip)
      //     .style("left", (d3.event.pageX) + "px")
      //     .style("top", (d3.event.pageY) + "px");

      /*

        Now add some bars representing category sales in the county
        This is long but yeilds a great result. In my other D3 course you
        go into detail about making bar charts to understand this further.

      */

      var margin = {top: 20, right: 30, bottom: 30, left: 40},
          height = 60,
          width = 200;

      // var x = d3.scaleBand()
      //     .rangeRound([0, width], .1);

      // var y = d3.scaleLinear()
      //     .range([height, 0]);

      // var xAxis = d3.axisBottom(x);

      // var yAxis = d3.axisLeft(y);


      // var chart = barTooltip.append("svg")
      //     .attr("width", width + margin.left + margin.right)
      //     .attr("height", height + margin.top + margin.bottom)
      //   .append("g")
      //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //make sure to filter to the current ID
        // x.domain(catSales.map(function(d) { return d.category; }));
        // x.domain("price");
        // y.domain([0,10000000]);

        // chart.append("g")
        //     .attr("class", "x-axis")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(xAxis);

        // chart.append("g")
        //     .attr("class", "y-axis")
        //     .call(yAxis);

        // chart.selectAll("#barChart")
        //     .data(pricedata)
        //     .enter()
        //     .append("rect")
        //     //apply filter for the state we're currently looking at
        //     .filter(function(data) {
        //       return data.region_name == circleName
        //     })
        //     .attr("class", "bar")
        //     .attr("x", function(data) { return 71; })
        //     .attr("y", function(data) {
        //       return y(data.zindex);
        //     })
        //     .attr("height", function(data) {
        //       return height - y(data.zindex);
        //     })
        //     .attr("width", x.bandwidth());

    })
    .on("mouseleave", function(d) {
      d3.select(this)
      .style("stroke-width", .25)
      .style("stroke-dasharray", 1)

      d3.select("#neighborhoodText")
      .transition()
      .style("opacity", 0);
    });

    svg.append("g")
      .attr("class", "bubble")
      .selectAll("circle")
      .data(nyc.features)
      .enter().append("circle")
      .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
      .attr("r", function(d) { return radius(crimeByName[d.properties.neighborhood]); })
}