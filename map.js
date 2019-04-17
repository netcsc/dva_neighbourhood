
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

var radius = d3.scaleSqrt()
  .domain([0, 1e6])
  .range([0, 100]);

var crimeIdxScale = d3.scaleLinear()
  .domain([0, 40000])
  .range([0, 10]).clamp(true);

var priceIdxScale = d3.scaleLinear()
  .domain([100000, 1500000])
  .range([0, 10]).clamp(true);

var formatPrice = d3.format(".2s");
var formatNum = d3.format(".1f");

var formatRatio = d3.format("%");

var barTooltip = d3.select("#neighborhood")

function showToolTip(d, priceByName, pricedata, crimedata, default_year) {

  var priceIndex = priceIdxScale(priceByName[d.properties.neighborhood.toUpperCase()]);

  var crimeIndex = crimeIdxScale(getCrimeData(d, crimedata, default_year));
	var livingIndex = 10 - (priceIndex + crimeIndex)/2.0

  var tip = "<h3>" + d.properties.neighborhood + "</h3>";
  tip = tip+"<h4>borough: " + d.properties.borough  + "<h4>";
  if (priceIndex){
    tip = tip+"<strong>Avg Sale Price of 2018:</strong> $" + formatPrice(priceByName[d.properties.neighborhood.toUpperCase()]) + "<br/>";
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
    .attr("class", "tooltip")

  barTooltip.html(tip)
  .style("left", (d3.event.pageX) + "px")
  .style("top", (d3.event.pageY) + "px");

  var margin = {top: 20, right: 30, bottom: 30, left: 55},
    height = 60,
    width = 200;

  if (priceIndex){


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
      y.domain([0,10000]);

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
          .attr("x", function(data) { return 20; })
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

    //make sure to filter to the current ID
    // x.domain(catSales.map(function(d) { return d.category; }));
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
    // console.log(crime2017);
    chart.selectAll("#barChart")
        .data(crimedata)
        .enter()
        .append("rect")
        .filter(function(data) {
          return data.Neighborhood == circleName;
        })
        .attr("class", "bar")
        .attr("x", function(data) {
          return 10 + crime_x(data.Year); })
        .attr("y", function(data) {
          return crime_y(data.Crime_Rate);
        })
        .attr("height", function(data) {
          return height - crime_y(data.Crime_Rate);
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
  for (crime in crimedata){
    if (crimedata[crime].Neighborhood == d.properties.neighborhood && crimedata[crime].Year == year){
      return crimedata[crime].Crime_Rate;
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
    .attr("x", -6)
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


//read in data
queue()
  .defer(d3.json, "nyc.json") // read geo data for nyc
  .defer(d3.json, "http://54.89.25.157/boroughs") // read housing data
  .defer(d3.csv,"crime_index_per_neighborhood_data/crime_all.csv")
  .await(ready);

  function ready(error, nyc, pricedata, crimedata) {
    if (error) throw error;

    var priceByName = {}
    pricedata.forEach(function(d){
      priceByName[d.region_name] = + d.average_sale_price;

    });


    // var crimeByName = {};

    // crime2017.forEach(function(d){
    //   crimeByName[d.Neighborhood]={};

    //   crimeByName[d.Neighborhood][2017] = + d.Crime_Rate;
    // });
    // crime2016.forEach(function(d){
    //   crimeByName[d.Neighborhood][2016] = + d.Crime_Rate;
    // });

	// console.log(crimeByName);
  //   function formatSales(val) {
  //     var prefix = d3.formatPrefix(val),
  //         format = d3.format(".1f");
  //     return format(prefix.scale(val)) + prefix.symbol;
  //   }

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
      //console.log(d.properties.neighborhood);
      //console.log(priceByName[d.properties.neighborhood]);
      return color(priceByName[d.properties.neighborhood.toUpperCase()]);
    })
    .on("mouseenter",function(d) {
      showToolTip(d, priceByName, pricedata, crimedata, "2017");
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
        showToolTip(d, priceByName, pricedata, crimedata, "2017");
      })
      .on("mouseout", function(d) {

        barTooltip.transition()
            .duration(500)
            .style("opacity", 0);
      });
}