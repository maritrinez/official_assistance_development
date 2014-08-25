/*

Two different graphs in two different SVG.
#graphTotal : Total bar graph
#graphSectors: Sectors bar charts 
*/

// Set the dimensions for both
	var margin = 50;
	var width = 800;
	var	height = 400;



// SVG #graphTotal
// Set the scale
	
	var xScaleT = d3.scale.linear()
					.range([width-margin, 0]);
	var yScaleT = d3.scale.ordinal()
					.rangeRoundBands([0, width/20-margin], 0.1);


// Create the SVG
	var svgTotal = d3.select("#graphTotal")
					 .append("svg")
					 .attr("width", width)
					 .attr("height", height/10);	


// SVG #graphSectors

		// Set the scale
		var xScale = d3.scale.ordinal()
						.rangeRoundBands([0, width-margin], 0.1); // Range for the bands plus, percentage of each band dedicated to be space.
		var yScale = d3.scale.linear()
						.range([height/2-margin, 0]);

		var yScaleUp = 	d3.scale.linear()
							.range([0, height/2-margin]);			

        

		// Create the SVG
		var svg1 = d3.select("#graphSectors")
					.append("svg")
					.attr("width", width)
					.attr("height", height);		
		
		// Set up the the yAxis to show the grid.

		var yAxis = d3.svg.axis()
						.scale(yScale)
						.tickSize(-width, 0, 0)
						.orient("right")
						.ticks(5)
						.tickFormat(function (d) { return d/1000000; });

		var yAxisUp = d3.svg.axis()
						.scale(yScaleUp)
						.tickSize(-width, 0, 0)
						.orient("right")
						.ticks(5)
						.tickFormat(function (d) { return d/1000000; });			


		mouseover = function (d, i) {
			var xPosition = parseFloat(d3.select(this).attr("x"))+xScale.rangeBand()/2 - 10;
			var yPosition = (height/2 - xScale.rangeBand()/2-5) - yScale(d.value) +160 ;

			d3.select("#tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.select("#value")
				.html("<strong>Año: </strong>" + d.year + "<br><strong>Categoría: </strong>" + d.sector + "<br><strong>AOD: </strong>" + (Math.round(d.value/1000000)) + " millones de €");

			d3.select("#tooltip").classed("hidden", false)

			d3.select(this)
				.attr("stroke", function (d) {return d3.hsl(d.color).brighter(0.9);})
				.attr("stroke-width", "1.5");
		};

		mouseoverT = function (d, i) {
			var xPosition = parseFloat(d3.select(this).attr("width")) + 70;
			var yPosition = 205;

			d3.select("#tooltip")
				.style("left", xPosition + "px")
				.style("top", yPosition + "px")
				.select("#value")
				.html("<strong>Año: </strong>" + d.year + "<br><strong>AOD: </strong>" + (Math.round(d.value/1000000)) + " millones de €");

			d3.select("#tooltip").classed("hidden", false)

			d3.select(this)
				.attr("stroke", function (d) {return d3.hsl(d.color).brighter(0.9);})
				.attr("stroke-width", "1.5");
		};

    	mouseout = function () {
    			d3.select("#tooltip").classed("hidden", true);
    			d3.select(this)
    			  .attr("stroke-width", "0");
    	};
	



// Load the data
		
AODdata = [];
NoTotalData = [];

d3.csv("AODdata.csv", function (error, data) {
	data.forEach(function (d) {
		d.value = +d.value;
		d.dif = +d.dif;
		d.difPer = +d.difPer;
	});  
	
	AODdata = data;
	NoTotalData = data.filter(function (d) {return d.category != "Total"; })

	// Draw the firsts elemnts
	drawFixElements(AODdata);
	drawPositiveBars(AODdata, 2008);
	drawTotal(AODdata, 2008);


	// Draw the interaction elements
	d3.select("#x2008").on("click",function(){
	 	d3.selectAll(".buttonSelected").classed("buttonSelected", false);
	 	d3.select(this).classed("buttonSelected", true);
	 	drawPositiveBars(AODdata, 2008);
	 	drawDifBars(AODdata, 2008);
	 	drawTotal(AODdata, 2008);

	 	return false;
	});

	d3.select("#x2009").on("click",function(){
	 	d3.selectAll(".buttonSelected").classed("buttonSelected", false);
	 	d3.select(this).classed("buttonSelected", true);
	 	
	 	drawPositiveBars(AODdata, 2009);
	 	drawDifBars(AODdata, 2009);
	 	drawTotal(AODdata, 2009);

	 	return false;
	 });

	d3.select("#x2010").on("click",function(){
	 	d3.selectAll(".buttonSelected").classed("buttonSelected", false);
	 	d3.select(this).classed("buttonSelected", true);

	 	drawPositiveBars(AODdata, 2010);
	 	drawDifBars(AODdata, 2010);
	 	drawTotal(AODdata, 2010);
	 	return false;
	});

	d3.select("#x2011").on("click",function(){
	 	d3.selectAll(".buttonSelected").classed("buttonSelected", false);
	 	d3.select(this).classed("buttonSelected", true);
	 	drawPositiveBars(AODdata, 2011);
	 	drawDifBars(AODdata, 2011);
	 	drawTotal(AODdata, 2011);
	 	return false;
	});

	d3.select("#x2012").on("click",function(){
	 	d3.selectAll(".buttonSelected").classed("buttonSelected", false);
	 	d3.select(this).classed("buttonSelected", true);
	 	drawPositiveBars(AODdata, 2012);
	 	drawDifBars(AODdata, 2012);
	 	drawTotal(AODdata, 2012);
	 	return false;
	});
	
});


// The function to draw the grid, the legend and the 'x axis' images.

function drawFixElements (data) {
	
	var myData = data.filter(function (d) { return d.year == 2008 & d.category != "Total"; });
	
	var legendData = d3.nest()
					   .key(function(d) { return d.category; })
						   .entries(myData)
					   .map(function(entry) { return entry.values[0]; });


	xScale.domain(d3.range(myData.length));
	yScale.domain([d3.max(NoTotalData, function (d) {return +d.value;}),0]);
	yScaleUp.domain([d3.max(NoTotalData, function (d) {return +d.value;}), 0]);

	// The axis
	svg1.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + (width - margin) + "," + (height/2 + xScale.rangeBand()/2+5) + ")")
		.call(yAxis);

	svg1.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + (width - margin) + "," + (xScale.rangeBand()/2+10) + ")")
		.call(yAxisUp);

	// The legend
	var legend = svg1.append("g")
				.attr("class","legend")
				.attr("transform","translate("+0.1+","+ (height - 40) +")")
					.style("font-size","12px");

		legend.selectAll("circle.legend")
			  .data(legendData)
			  .enter()
			  .append("circle")
			  .attr("cx", function (d,i) {return d.category != "Sin especificar" ? 3.1*xScale(i) : 3.4*xScale(i); } )
			  .attr("cy", 0)
			  .attr("r", 10)
			  .style("fill", function (d) {return d3.hsl(d.color); });

		legend.selectAll("text.legend")
			  .data(legendData)
			  .enter()
			  .append("text")
			  .attr("x", function (d,i) {return d.category != "Sin especificar" ? 3.1*xScale(i) : 3.4*xScale(i); })
			  .attr("y", 0)
			  .attr("dy", ".35em")
			  .attr("dx", "1.2em")
			  //.attr("text-anchor", "middle")
			  .text(function (d) {return d.category; });
};



// The function to draw the Total bar
function drawTotal(data, year) {
	dataTotal = data.filter(function (d) {return d.category == "Total"; })
	dataTotalYear = dataTotal.filter(function (d) {return d.year == year; })
	dataTotal2008 = dataTotal.filter(function (d) {return d.year == 2008; })

	xScaleT.domain([d3.max(dataTotal, function (d) {return +d.value; }), 0]);
	yScaleT.domain(d3.range(dataTotal.length));

	var bar2008 = svgTotal.selectAll("rect.total2008").data(dataTotal2008);

	bar2008.enter()
		   .append("rect")
		   .attr("class", "total2008")
		   .attr("x", 0)
		   .attr("y", 0)
		   .attr("width", function (d) {return xScaleT(d.value); })
		   .attr("height", 35)
		   .attr("stroke", function (d) {return d3.hsl(d.color); })	
		   .attr("stroke-width", "1")
		   .attr("fill-opacity", "0");

	var barTotal = svgTotal.selectAll("rect.total").data(dataTotalYear);

	barTotal.enter()
			.append("rect")
			.attr("class", "total")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 0)
			.attr("height", 35)
			.attr("fill", function (d) {return d3.hsl(d.color); })
			.on("mouseover", mouseoverT)
			.on("mouseout", mouseout);

	barTotal.transition()
			.duration(2000)
			.attr("width", function (d) {return xScaleT(d.value); })

	// Attach the percentage label 	

	var difText = svgTotal.selectAll("text.difText").data(dataTotalYear)

	difText.enter()
	 	.append("text")
	 	.text(function (d) {return d.dif != 0 ? "- " + d.difPer+"%" : ""; })
	 	.attr("class", "difText")
	 	.attr("x", function (d) {return xScaleT(d.value) -15; })
	 	.attr("y", 15)
	 	.attr("dy", "0.5em")
		.attr("text-anchor", "middle")
		.attr("opacity", 0)
		.style("fill", "white");

	difText.transition()
		  .duration(2000)
		  .text(function (d) { return d.dif != 0 ? "- " + d.difPer+"%" : ""; })
		  .attr("opacity", 1)
		  .attr("x", function (d) {console.log(dataTotalYear); return xScaleT(d.value) -15; });

	var myText = svgTotal.selectAll("text.total").data(dataTotalYear)

	myText.enter()
		  .append("text")
		  .text(function (d) {return "AOD Total año " + d.year;} )
		  .attr("class", "total")
		  .attr("x", 10)
		  .attr("y", 15)
	   	  .attr("dy", "0.5em")
		  .style("fill", "white");

	myText.transition()
		  .duration(1000)
		  .text(function (d) {return "AOD Total año " + d.year;} );

};


// The function to draw the positive bars

function drawPositiveBars (data, year){
	
	var myData = data.filter(function (d) { return d.year == year & d.category != "Total"; });
	var titular = myData[0].titular;

	xScale.domain(d3.range(myData.length));
	yScale.domain([d3.max(NoTotalData, function (d) {return +d.value;}),0]); 	


	var myBars = svg1.selectAll("rect.addon").data(myData);

	myBars.enter()
		.append("rect")
		.attr("class", "addon")
		.attr("x", function (d,i) {return xScale(i); })
		.attr("y", height/2 - xScale.rangeBand()/2-5)
		.attr("width", xScale.rangeBand())
		.attr("height", 0)
		.attr("fill", function (d) {return d3.hsl(d.color);})
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);
		

	myBars.transition()
		.duration(2000)
		.delay(500)
		.attr("y", function (d) {return (height/2 - xScale.rangeBand()/2-5) - yScale(d.value); })
		.attr("height", function (d) {return yScale(d.value);});					

	// Enter the 'xAxis' images
	var myImages = svg1.selectAll("image").data(myData);

	myImages.enter()
		.append("image")
		.attr("xlink:href",function (d) {return d.href; })
		.attr("width", xScale.rangeBand())
		.attr("height", xScale.rangeBand())
		.attr("x", function (d,i) { return xScale(i); })
		.attr("y", height/2 - xScale.rangeBand()/2)
		.style("opacity", 0)
		.on("mouseover", mouseover)
		.on("mouseout", mouseout);

	myImages.transition()
		.duration(1000)
		.delay(500)
		.style("opacity", 1);


    // Print the titular

  	var insight = d3.select("#insight")
  		.select("#value")
  		.html(titular)
  		.style("opacity", 0)
	    .style("visibility", "visible");

	insight.transition()
  			.delay(1000)
  			.duration(1500)
  			.style("opacity", 1);
};

// The function to draw the dif bars

function drawDifBars (data, year) {

	var difData = data.filter(function (d) { return d.year == year & d.category != "Total"; });
	
	xScale.domain(d3.range(difData.length));
	yScale.domain([d3.max(NoTotalData, function (d) {return +d.value;}),0]);


	var difBars = svg1.selectAll("rect.difBars").data(difData);
	
	var heightBars = function (d) {
		if (d.dif >0){
			return yScale(d.dif);	
		}  else if (d.dif < 0){
			return yScale(-d.dif);	
		}  else { return 0; }
	};

	difBars.enter()
		.append("rect")
		.attr("class", "difBars")
		.attr("x", function (d,i) {return xScale(i); })
		.attr("y", function (d) {return d.dif > 0 ? height/2 + xScale.rangeBand()/2+5 : height/2 - xScale.rangeBand()/2-5; })
		.attr("width", xScale.rangeBand())
		.attr("height", 0)
		.attr("fill", function (d) {return d.dif > 0 ? d3.hsl(d.color).brighter(0.8) : d3.hsl(d.color).darker(2);});

	difBars.transition()
		.duration(2000)
		.delay(500)
		.attr("y", function (d) { return d.dif > 0 ? height/2 + xScale.rangeBand()/2+5 : (height/2 - xScale.rangeBand()/2-5) - yScale(d.value); })
		.attr("height", heightBars)
		.attr("fill", function (d) {return d.dif > 0 ? d3.hsl(d.color).brighter(0.8) : d3.hsl(d.color).darker(2);});
		

	// Attach the percentage label for both, positive an negative dif bars	
	var myText = svg1.selectAll("text.difText").data(difData)
	
	myText.enter()
	 	.append("text")
	 	.text(function (d) {return d.dif > 0 ? "- " + d.difPer+"%" : ""; })
	 	.attr("class", "difText")
	 	.attr("x", function (d,i) {return xScale(i) + (xScale.rangeBand()/2); })
	 	.attr("y", function (d) {return height/2 + xScale.rangeBand()/2+20; })
		.attr("text-anchor", "middle")
		.attr("opacity", 0)
		.style("fill", "white");
	

	var textPosition = function (d) {
		if (year != 2008) {
			if (d.dif > 0){
				return (height/2 + xScale.rangeBand()/2+5) + yScale(d.dif)+15; 	
			} else { 
				return (height/2 - xScale.rangeBand()/2-5) - yScale(d.value)-5;}
		} else {
			return height/2 + xScale.rangeBand()/2+20; }
		}

			
	if (year != 2008) {
			myText.transition()
			.duration(2000)
			.delay(500)
			.text(function (d) {return d.dif > 0 ? "- " + d.difPer+"%" : "+ " +(-d.difPer)+"%"; })
		 	.attr("y", textPosition)
		 	.attr("opacity", 1);
		
	} else {
		myText.transition()
			.duration(2000)
			.delay(500)
			.attr("y", textPosition)
		 	.attr("opacity", 0);
	}	
};