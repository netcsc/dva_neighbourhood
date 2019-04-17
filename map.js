
var svg = d3.select("svg"),
width = +svg.attr("width"),
height = +svg.attr("height");


var y = d3.scaleLinear()
    .domain([100000, 1000000])
    .rangeRound([100, 360]);


var color = d3.scaleThreshold()
    .domain(d3.range(300000, 1650000, 150000))
    .range(colorbrewer.Greens[9]);


	//console.log(color.domain());



var crimeIdxScale = d3.scaleLinear()
  .domain([0, 40000])
  .range([0, 10]).clamp(true);

var priceIdxScale = d3.scaleLinear()
  .domain([100000, 1500000])
  .range([0, 10]).clamp(true);

var formatPrice = d3.format(".2s");
var formatNum = d3.format(".1");

var formatRatio = d3.format("%");

var barTooltip = d3.select("#neighborhood")

function showToolTip(d, pricedata, crimedata, price_default_year, crime_default_year) {

  var priceIndex = priceIdxScale(getPriceData(d , pricedata, price_default_year));

  var crimeIndex = crimeIdxScale(getCrimeData(d, crimedata, crime_default_year));
	var livingIndex = 10 - (priceIndex + crimeIndex)/2.0

  var tip = "<h3>" + d.properties.neighborhood + "</h3>";
  tip = tip+"<h4>borough: " + d.properties.borough  + "<h4>";
  if (priceIndex){
    tip = tip+"<strong>Avg Sale Price of 2018:</strong> $" + formatPrice(getPriceData(d , pricedata, price_default_year)) + "<br/>";
    tip = tip+"<strong>Price Index:</strong> " + formatNum(priceIndex)+ "<br/>";
  }
  if (crimeIndex){
    tip = tip+"<strong>Crime Index:</strong> " + formatNum(crimeIndex)+ "<br/>";
  }
  if (priceIndex && crimeIndex){
    tip = tip+"<strong>Living Index:</strong> " + formatNum(livingIndex)+ "<br/>";
  }


  barTooltip.transition()
    .style("opacity", 0.9)
    .attr("class", "tooltip");

  barTooltip.html(tip)
  .style("left", (d3.event.pageX) + "px")
  .style("top", (d3.event.pageY) + "px");

  var margin = {top: 20, right: 30, bottom: 30, left: 55},
    height = 60,
    width = 200;

  if (priceIndex){
    tip = tip+"<strong>Price trend</strong><br/>";


    var x = d3.scaleBand()
        .rangeRound([0, width], 0.1);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y).tickFormat(d3.format("s"))
    .ticks(2);

    var chart = barTooltip.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(["2018", "2017", "2016", "2015", "2014"]);
      y.domain([0,4000000]);

      chart.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      chart.append("g")
          .attr("class", "y-axis")
          .call(yAxis);

      circleName = d.properties.neighborhood
      chart.selectAll("#barChart")
          .data(pricedata)
          .enter()
          .append("rect")
          //apply filter for the state we're currently looking at
          .filter(function(data) {
            return data.region_name == circleName.toUpperCase()
          })
          .attr("class", "bar")
          .attr("x", function(data) {
            return 10 + x(data.year);

          })
          .attr("y", function(data) {
            return y(data.average_sale_price);
          })
          .attr("height", function(data) {
            return height - y(data.average_sale_price);
          })
          .attr("width", 0.5*x.bandwidth());
  }

  if (crimeIndex){
    // Add crime bar chart
    var crime_x = d3.scaleBand()
        .rangeRound([0, width], 0.1);

    var crime_y = d3.scaleLinear()
        .range([height, 0]);

    var crime_xAxis = d3.axisBottom(crime_x);

    var crime_yAxis = d3.axisLeft(crime_y).tickFormat(d3.format("s"))
    .ticks(2);

    var chart = barTooltip.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var years = ["2017", "2016", "2015", "2014", "2013"];
    crime_x.domain(years);
    crime_y.domain([0,40000]);

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(crime_xAxis);

    chart.append("g")
      .attr("class", "y-axis")
      .call(crime_yAxis);

    circleName = d.properties.neighborhood;
    chart.selectAll("#barChart")
        .data(crimedata)
        .enter()
        .append("rect")
        .filter(function(data) {
          return data.neighborhood == circleName;
        })
        .attr("class", "bar")
        .attr("x", function(data) {
          if(crime_x(data.year)){
            return 10 + crime_x(data.year);
          }
          return -1 ;
        })
        .attr("y", function(data) {
          return crime_y(data.crime_rate);
        })
        .attr("height", function(data) {
          return height - crime_y(data.crime_rate);
        })
        .attr("width", 0.5*crime_x.bandwidth());
  }
}

function getCrimeBubbleRadius(d, crimedata, year){
  var crime_data = getCrimeData(d, crimedata, year);
  if (crime_data > 0 ){
    return radius(crime_data);
  }
  return 0;
}

function getCrimeData(d, crimedata, year){
   // console.log(crimedata);
  for (var crime in crimedata){
    if (crimedata[crime].neighborhood && crimedata[crime].neighborhood.toUpperCase() == d.properties.neighborhood.toUpperCase() && crimedata[crime].year == year){
      return crimedata[crime].crime_rate;
    }
  }
  return 0;
}

function getPriceData(d, priceData, year){
  for (var data in priceData){
    if (priceData[data].region_name && d.properties.neighborhood &&
      priceData[data].region_name.toUpperCase() == d.properties.neighborhood.toUpperCase() &&
      priceData[data].year == year){
      return priceData[data].average_sale_price;
    }
  }
  return 0;
}
// http://data.beta.nyc//dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson

var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(800,0)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
	  //console.log(d);
      if (d[0] == null) d[0] = y.domain()[0];
      if (d[1] == null) d[1] = y.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("width", 20)
    .attr("y", function(d) { return y(d[0]); })
    .attr("height", function(d) { return y(d[1]) - y(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.append("text")
    .attr("class", "caption")
    .attr("y", y.range()[0]-10)
    .attr("x", -20)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Average sale price");

g.call(d3.axisLeft(y)
    .tickSize(13)
    .tickFormat(function(y, i) { return i ? y : y; })
    .tickValues(color.domain()))
  .select(".domain")
    .remove();

var radius = d3.scaleSqrt().domain([0, 4e4]).range([0, 25]);

var legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(" + (width - 170) + "," + (height - 100) + ")")
  .selectAll("g")
  .data([4e3, 2e4, 4e4])
  .enter()
  .append("g");

  legend.append("circle")
    .attr("cy", function(d) { return -radius(d); })
    .attr("r", radius);

  legend.append("text")
      .attr("y", function(d) { return -2 * radius(d); })
      .attr("dy", "1.3em")
      .text(d3.format(".1s"));
      legend.append("text")
      .attr("class", "caption")
      .attr("y", y.range()[0]-80)
      .attr("x", 0)
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("font-weight", "bold")
      .text("Crime Index");

//read in data
queue()
  .defer(d3.json, "nyc.json") // read geo data for nyc
  // .defer(d3.json, "http://localhost:5000/boroughs") // read housing data
  .defer(d3.csv, "NY_neighborhood_avg_sales_all.csv")
  .defer(d3.csv,"crime_index_per_neighborhood_data/crime_all.csv")
  .await(ready);

  function ready(error, nyc, pricedata, crimedata) {
    if (error) throw error;

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
      return color(getPriceData(d, pricedata, "2018"));
    })
    .on("mouseenter",function(d) {
      showToolTip(d, pricedata, crimedata, "2018", "2017");
    })
    .on("mouseout", function(d) {

      barTooltip.transition()
          .duration(500)
          .style("opacity", 0);
    });

    // Add crime bubble
    svg.append("g")
    .attr("class", "bubble")
    .selectAll("circle")
    .data(nyc.features)
    .enter().append("circle")
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("r",function(d) {
      return getCrimeBubbleRadius(d, crimedata, "2017");
    })
    .on("mouseenter",function(d) {
      showToolTip(d, pricedata, crimedata, "2018", "2017");
    })
    .on("mouseout", function(d) {

      barTooltip.transition()
          .duration(500)
          .style("opacity", 0);
    });


}