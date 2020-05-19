var themes = ["SPL_THEME1","RPL_THEME1","SPL_THEME2","RPL_THEME2","SPL_THEME3","RPL_THEME3",
"SPL_THEME4", "RPL_THEME4", "SPL_THEMES", "RPL_THEMES"]

//"F_THEME1","F_THEME2", "F_THEME3", "F_THEME4"

var themesDefinitions ={
    "SPL_THEME1":"Sum of series for Socioeconomic",
    "RPL_THEME1":"Percentile ranking for Socioeconomic",
    "SPL_THEME2":"Sum of series for Household Composition",
    "RPL_THEME2":"Percentile ranking for Household Composition",
    "SPL_THEME3":"Sum of series for Minority Status/Language",
    "RPL_THEME3":"Percentile ranking for series for Minority Status/Language",
    "SPL_THEME4":"Sum of series for Housing Type/Transportation",
    "RPL_THEME4":"Percentile ranking for Housing Type/Transportation",
    "SPL_THEMES":"Sum of series themes", 
    "RPL_THEMES":"Overall percentile ranking"
}

var colors = {
    "THEME1":"#3b4c22",
    "THEME2":"#8fa728",
    "THEME3":"#7a9263",
    "THEME4":"#4ba03d",
    "THEMES":"#000000",
    "publicTransit":"#387390"
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

queue()
.defer(d3.csv, "combined.csv")
.await(ready);

function ready(error, data){

    //### Create Crossfilter Dimensions and Groups
    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    for(var t in themes){
        var column = themes[t]
        var divName = column.split("_")[1]
        barChart(column,ndx,100,500)
    }
    
    barChart("percent_publicTransit",ndx,200,800)
    
   // barChart("tempMin",ndx,150,500,"#EDA929")
    rowChart("STATE",ndx,"#agency-chart",800,500,20,"red") 
    dataCount(ndx,all)
    dc.renderAll();
};


   /*
    <div id="temperature-chart">
           Daily High Temperature
           <span class="reset" style="display: none;">: <span class="filter"> </span></span>
           <a class="reset" href="javascript:tempChart.filterAll();dc.redrawAll();" style="display: none;">reset</a>
           <div class="clearfix"></div>
       </div>*/
   

function barChart(column,ndx,height,width){
    var max = 0
    var min = 999

    var columnDimension = ndx.dimension(function (d) {
        if(parseFloat(d[column])>max){
            max = d[column]
        }
        if(d[column]<min && d[column]!=-999){
            min = d[column]
        }
        
         if(d[column]!=-999){
            return Math.round(d[column]*100)/100;
        }
        
        
    });
    var columnGroup = columnDimension.group();
    
    if(column.split("_")[0]=="RPL"){
        width = 400
        height = 100
    }else if(column.split("_")[0]=="sPL"){
        width = 600
    }
    
    var divName = column.split("_")[1]
    
    var color = colors[divName]
    
    d3.select("#"+divName).append("div").attr("id",column).style("width",width+"px").style("height",(height+30)+"px")
    var chart = dc.barChart("#"+column);
    
    
    
    
    d3.select("#"+column).append("text").attr("class","reset")
        .on("click",function(){
            chart.filterAll();
            dc.redrawAll();
        })
        .style("display","none")
        .text("reset")
        .attr("cursor","pointer")
        
        
    d3.select("#"+column).append("div").attr("class","chartName").html(themesDefinitions[column]).style("color",color)
        d3.select("#"+divName).style("color",color)
      
    chart.width(width)
            .height(height)
            .margins({top: 10, right: 20, bottom: 30, left: 40})
            .ordinalColors([color])
            .dimension(columnDimension)
            .group(columnGroup)
          // .centerBar(true)
            .elasticY(true)
            .xUnits(function(){return Math.abs(Math.round(max-min))*100;})
            .x(d3.scale.linear().domain([min,max]))
            .xAxis()
            .ticks(3)
       
       
        if(column == "percent_publicTransit"){            
            chart.elasticY(false)
            chart.y(d3.scale.linear().domain([0,200]))
        }
        chart.yAxis()
            .ticks(4);
            
         
            
      chart.on("preRedraw", function (chart) {
          chart.rescale();
      });
      chart.on("preRender", function (chart) {
          chart.rescale();
      });
                  
      //          dc.renderAll();
		
}
function rowChart(column, ndx,divName,height,width,topQ,color){
    d3.select("#container").append("div").attr("id",column).style("width",width+"px").style("height",height+"px")
    var chart = dc.rowChart("#"+column);

    var columnDimension = ndx.dimension(function (d) {
        return d[column];
    });
    var columnGroup = columnDimension.group();

    chart.width(width)
        .height(height)
        .margins({top: 0, left: 250, right: 10, bottom: 20})
        .group(columnGroup)
        .dimension(columnDimension)
    	.labelOffsetX(-220)
    	.labelOffsetY(12)
    	//.data(function(agencyGroup){return columnGroup.top(topQ)})
    	.ordering(function(d){ return -d.value })
        .ordinalColors(["#000000"])
        .label(function (d) {
            return d.key+": "+ d.value+ " tracts";
        })
        // title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4)
    
}
function dataCount(dimension,group){
    dc.dataCount(".dc-data-count")
        .dimension(dimension)
        .group(group)
        // (optional) html, for setting different html for some records and all records.
        // .html replaces everything in the anchor with the html given using the following function.
        // %filter-count and %total-count are replaced with the values obtained.
        .html({
            some:"%filter-count selected out of <strong>%total-count</strong> tracts | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all:"All  %total-count tracts selected."
        })
}

//#### Version
//Determine the current version of dc with `dc.version`
d3.selectAll("#version").text(dc.version);
