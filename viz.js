function drawRadialChart(svgClass, data_set){
     // Dimensions
     let margin = {left: 330, right: 28, top: 28, bottom: 28};
     let width, height;
     let innerRadius = 100;

     // Data
     let data = data_set[0]["data"];
     console.log(data)
     const days = d3.timeDay.range(new Date(2019, 0, 1), new Date(2020, 0, 1));
     const diameter = Math.min(innerWidth, innerHeight);
     width = diameter - margin.left - margin.right;
     height = diameter - margin.top - margin.bottom;

     // Scales
     const xScale = d3.scaleTime()
         .domain(d3.extent(days))
         .range([0, Math.PI * 2]);

     const yScale = d3.scaleRadial()
         .domain([0, 2500000])

     // Generators
     const areaGenerator = d3.areaRadial()
         .angle(d => {
           console.log(d["date"]);
           return xScale(new Date(d["date"]));
         })
         .innerRadius(innerRadius)
         .outerRadius(d => yScale(d["acres_burned"]))
         .curve(d3.curveBasis);

     // Elements
     const svg = d3.select(svgClass).append("svg")
     .attr("viewBox", `0 0 2000 2000`);

     const g = svg.append("g");

     //Text 
     svg.append("text")
     .attr("class", "year")
     .attr("x", 830)
     .attr("y", 520)
     .text("2010")
     .style("font-size", 35)
     .style("alignment-baseline", "middle")
     .style("text-anchor", "middle")
     .style("font-weight", "bold")

     const xAxis = g.append("g")
         .attr("class", "axis");

     const xAxisTicks = xAxis.selectAll(".tick")
         .data(d3.timeMonth.every(1).range(...d3.extent(days)))
       .enter().append("g")
         .attr("class", "tick");

     xAxisTicks.append("text")
         .attr("dy", -15)
         .text(d => `${d3.timeFormat("%b")(d)}.`);

     xAxisTicks.append("line")
         .attr("y2", -10);

     const yAxis = g.append("g")
         .attr("class", "axis");

     const yAxisTicks = yAxis.selectAll(".tick")
         .data(yScale.ticks(4).slice(1))
       .enter().append("g")
         .attr("class", "tick");

     const yAxisCircles = yAxisTicks.append("circle");

     const yAxisTextTop = yAxisTicks.append("text")
         .attr("dy", -5)
         .text(d => d);
     
     const yAxisTextBottom = yAxisTicks.append("text")
         .attr("dy", 12)
         .text(d => d);

     // Updater
     const duration = 750;
     redraw();
     let index = 0
     onresize = _ => redraw(true);
     d3.interval(_ => {
       index = index + 1
       if (index > data_set.length - 1) {
         index = 0
       }
       data = data_set[index]["data"]
       console.log(data)
       svg.select(".year")
       .transition()
      .text(2010 + index)
       redraw();
     }, duration * 2);

     function redraw(resizing){
       const diameter = Math.min(innerWidth, innerHeight);
       width = 1000;
       height = 1000;

       yScale
           .range([innerRadius, height / 2]);

       svg
           .attr("width", width + margin.left + margin.right)
           .attr("height", height + margin.top + margin.bottom);

       g
           .attr("transform", `translate(${margin.left + width / 2}, ${margin.top + height / 2})`);

       xAxisTicks
           .attr("transform", (d, i, e) => {
             const point = [width / 2, 0];
             const angle = i / e.length * 360;
             const rotated = geometric.pointRotate(point, 270 + angle);
             return `translate(${rotated}) rotate(${angle})`;
           });

       yAxisCircles
           .attr("r", d => yScale(d));

       yAxisTextTop.attr("y", d => yScale(d));

       yAxisTextBottom.attr("y", d => -yScale(d));

       // General update pattern for the area, whose data changes
       const area = g.selectAll(".area")
           .data([data]);
        
       if (resizing){
         area
             .attr("d", areaGenerator);
       }
       else {
         area.transition().duration(0)
             .attr("d", areaGenerator);
       }
       console.log(area);

       area.enter().append("path")
           .attr("class", "area")
           .attr("d", areaGenerator)
           .style("opacity", 0)
         .transition().duration(duration)
           .style("opacity", 1); 
     }
    }