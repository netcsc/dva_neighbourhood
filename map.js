
var y = d3.scaleLinear()
    .domain([100000, 1000000])
    .rangeRound([100, 360]);

var width = 960, height = 720;

var showHousing = true;
var showCrime = true;
var housing_weight = 0.5;

var color = d3.scaleThreshold()
    .domain(d3.range(300000, 1650000, 150000))
    .range(colorbrewer.Greens[9]);

var crimeIdxScale = d3.scaleLinear()
  .domain([0, 40000])
  .range([0, 10]).clamp(true);

var priceIdxScale = d3.scaleLinear()
  .domain([100000, 1500000])
  .range([0, 10]).clamp(true);

var formatPrice = d3.format(".2s");
var formatNum = d3.format(".2f");

var formatRatio = d3.format("%");

var barTooltip = d3.select("#neighborhood");
barTooltip.attr("class", "tooltip");

function showToolTip(d, pricedata, crimedata, price_default_year, crime_default_year) {

  var priceIndex = priceIdxScale(getPriceData(d , pricedata, price_default_year));

  var crimeIndex = crimeIdxScale(getCrimeData(d, crimedata, crime_default_year));
	var livingIndex = 10 - (housing_weight * priceIndex + (1- housing_weight) *crimeIndex)

  var tip = "<h3>" + d.properties.neighborhood + " (" + d.properties.borough + ") " + "</h3>";

  if (priceIndex){
    tip = tip+"<strong>Avg Sale Price of 2018:</strong> $" + formatPrice(getPriceData(d , pricedata, price_default_year)) + "<br/><br/>";
    tip = tip+"<strong>Price Index:</strong> " + formatNum(priceIndex)+ "<br/>";
  }
  if (crimeIndex){
    tip = tip+"<strong>Crime Index:</strong> " + formatNum(crimeIndex)+ "<br/>";
  }

  if (priceIndex && crimeIndex){
    tip = tip+"<strong>Living Index:</strong> " + formatNum(livingIndex)+ "<br/>";
  }

  if (priceIndex && crimeIndex){
    tip = tip+"<h4>5-Year price(above) and crime(below) graphs:</h4>";
  } else if (priceIndex){
    tip = tip+"<h4>5-year price graph :</strong>";
  } else if (crimeIndex){
    tip = tip+"<h4>5-year crime graph:</strong>";
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

    var yAxis = d3.axisLeft(y).tickFormat(d3.format(".1s"))
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

    var crime_yAxis = d3.axisLeft(crime_y).tickFormat(d3.format(".1s"))
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
          return 10 ;
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

var radius = d3.scaleSqrt().domain([0, 4e4]).range([0, 25]);



function create_map(nyc, pricedata, crimedata, htmlId, showHousing, showCrime){
  // var svg = d3.select("svg"),
  // width = +svg.attr("width"),
  // height = +svg.attr("height");
  var svg = d3.select(htmlId)
  .append("svg")
  .attr("width", width)
  .attr("height", height);

  var path = d3.geoPath()
  .projection(d3.geoConicConformal()
  .parallels([33, 45])
  .rotate([96, -39])
  .fitSize([width, height], nyc));

  if(showHousing){
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
  }



  if (showCrime){
    if (!showHousing){
      svg.selectAll("path")
        .data(nyc.features)
        .enter().append("path")
        .attr("d", path);
    }
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
}

//read in data
queue()
  .defer(d3.json, "nyc.json") // read geo data for nyc
  .defer(d3.json, "http://54.89.25.157/boroughs") // read housing data
  .defer(d3.json, "http://54.89.25.157/crimes")
  // .defer(d3.csv, "NY_neighborhood_avg_sales_all.csv")
  // .defer(d3.csv,"crime_index_per_neighborhood_data/crime_all.csv")
  .await(ready);

function ready(error, nyc, pricedata, crimedata) {
    if (error) {
      throw error;
    }
    create_map(nyc, pricedata, crimedata, "#map", true, true);
    addOption(nyc, pricedata, crimedata, "#options", "#map");
    addSlider();
}

function addOption(nyc, pricedata, crimedata, htmlId, mapId) {
  var optionData = ["Both", "Housing", "Crime", ];
  var w = 1000;
  var h = 1000;
  var select = d3.select(htmlId)
      .append('select')
      .attr('class','select')
      .attr("width", w)
      .attr("height", h)
      .on('change',onchange)

  var options = select
      .selectAll('option')
      .data(optionData).enter()
      .append('option')
      .text(function (d) { return d; });

  function onchange() {
      selectValue = d3.select('select').property('value');
      console.log(selectValue);
      if (selectValue == "Housing"){
        showCrime = false;
        showHousing = true;
      }
      if (selectValue == "Crime"){
        showHousing = false;
        showCrime = true;
      }
      if (selectValue == "Both"){
        showHousing = true;
        showCrime = true;
      }
      d3.select("#map").select("svg").remove();
      create_map(nyc, pricedata, crimedata, mapId, showHousing, showCrime);
    }
}

function addSlider(){
  var data = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  var sliderStep = d3
  .sliderBottom()
  .min(d3.min(data))
  .max(d3.max(data))
  .width(300)
  .tickFormat(d3.format('.1'))
  .ticks(9)
  .step(0.1)
  .default(0.5)
  .on('onchange', function(val){
    onchange(val)
  });

  var gStep = d3
    .select('#slider-step')
    .append('svg')
    .attr('width', 500)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(30,30)');

  gStep.call(sliderStep);

  d3.select('#value-step').text("Personal preference: housing weigh " +  d3.format('.1')(sliderStep.value()));

  function onchange(val) {
    housing_weight = d3.format('.1')(val);
    d3.select('#value-step').text("Personal preference: housing weigh " + housing_weight);
    console.log(showHousing);
    console.log(showCrime);
    console.log(housing_weight);
  }
}