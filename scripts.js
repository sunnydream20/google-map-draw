  // Initialize AG Grid with the correct settings
  var gridOptions = {
    columnDefs: [
      { headerName: "Name", field: "Name", editable: true },
      { headerName: "State", field: "State", editable: true },
    ],
    rowData: [
      { Name: "Mike Johnson", State: "California" },
      { Name: "Jim Green", State: "Texas" },
      { Name: "Jim Green", State: "Florida" },
    ],
    defaultColDef: {
      flex: 1,
      minWidth: 100,
      resizable: true,
      sortable: true,
      filter: true,
    },
    rowSelection: "single",
    animateRows: true,
  };

// Wait until the DOM content is fully loaded before initializing AG Grid and adding event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Initialize AG Grid
  var eGridDiv = document.querySelector("#grid-container");
  new agGrid.Grid(eGridDiv, gridOptions);

  // Clear table functionality
  document.getElementById("clearTableButton").addEventListener("click", function () {
    if (gridOptions.api) {
      var allNodes = [];
      gridOptions.api.forEachNode(function (node) {
        allNodes.push(node);
      });

      if (allNodes.length > 0) {
        gridOptions.api.applyTransaction({ remove: allNodes.map((node) => node.data) });
      } else {

      }
    } else {
      console.error("Grid API is not ready.");
    }
  });

  // Load the Google Charts package
  google.charts.load('current', { 'packages': ['geochart'], 'mapsApiKey': 'AIzaSyCrHu2RqNwhRGRCZtFhXVE6hh8KsAg7eKE' });
  google.charts.setOnLoadCallback(drawEmptyMap);
 
  // Function to draw an empty map initially
  function drawEmptyMap() {
    var data = google.visualization.arrayToDataTable([]);

    var options = {
      region: 'US',
      displayMode: 'regions',
      resolution: 'provinces',
      legend: 'none',
      projection: 'mercator',
      colorAxis: { colors: ['#f0f4f8', '#2b6cb0'] }
    };

    

    var chart = new google.visualization.GeoChart(document.getElementById('map_div'));
    chart.draw(data, options);
  }

  // Function to draw the map based on grid data
  function drawMap(mapData, personColors) {
    var rowData = [];
    gridOptions.api.forEachNode((node) => rowData.push(node.data));

    const coverageCount = {};
    const userCount = {};
        // Prepare the map data
    // const mapData = [['State', 'Coverage']];
    rowData.forEach(row => {
      console.log(row.Name)
        if (row.State) {
          console.log(getColor(row.Name))
            coverageCount[row.State] = getColor(row.Name); // Increment 
            userCount[row.State] = row.Name;
        }
    });

    
    mapData = [['State', 'Coverage']];
    for (const state in coverageCount) {
      mapData.push([state, coverageCount[state]]);
    }
    console.log(mapData)

    var options = {
      region: 'US',
      displayMode: 'regions',
      resolution: 'provinces',
      tooltip: { isHtml: true },
      legend: 'none',
      projection: 'mercator',
      colorAxis:  {minValue: 0, maxValue: 49,  colors:[
        '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#2ECC71',
        '#3498DB', '#9B59B6', '#E74C3C', '#F39C12', '#16A085',
        '#27AE60', '#2980B9', '#8E44AD', '#2C3E50', '#D35400',
        '#F39C12', '#C0392B', '#1ABC9C', '#D1C4E9', '#FFB74D',
        '#B2FF59', '#FF8A65', '#FFD54F', '#4DB6AC', '#FFAB40',
        '#FF6F61', '#6D4C41', '#8E24AA', '#6F9FD8', '#FFEE58',
        '#FF5252', '#EA80FC', '#FF4081', '#F57F17', '#00ACC1',
        '#7E57C2', '#FFCA28', '#8D6E63', '#616161', '#00897B',
        '#D32F2F', '#FBC02D', '#1976D2', '#388E3C', '#7B1FA2',
        '#C2185B', '#512DA8', '#0288D1', '#D32F2F', '#FBC02D',
        '#FF7043', '#F57C00', '#00897B', '#7B1FA2', '#5D4037'
    ]},
    };

    var data = google.visualization.arrayToDataTable(mapData);

    var view = new google.visualization.DataView(data);
view.setColumns([0, {
type: 'number',
calc: function (dt, row) {
  console.log(dt.getValue(row, 0))
    return {
        v: dt.getValue(row, 1),
        f: userCount[dt.getValue(row, 0)],
    }
}
}]);
    
    var chart = new google.visualization.GeoChart(document.getElementById('map_div'));
    chart.draw(view, options);
  }

    // Function to generate a unique color for each user
function getColor(name) {
  const colors = [
      1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51
  ];
  // Simple hash function to create a consistent index for the name
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length]; // Loop through colors based on name hash
}

  // Generate the map when 'Generate Coverage Map' is clicked
  document.getElementById("generateButton").addEventListener("click", function () {
    var rowData = [];
    gridOptions.api.forEachNode((node) => rowData.push(node.data));
    const mapData = [
      ['State', 'Coverage'],
      ...rowData.map((row, index) => [row.State, 1])
    ];

    const personColors = {};
    rowData.forEach((row, index) => {
      personColors[row.Name] = getColor(index);
    });

    // Display the map
    drawMap(mapData, personColors);
  });

  // Add Title functionality
  document.getElementById("addTitleButton").addEventListener("click", function () {
    var mapTitle = document.getElementById("mapTitle").value;
    var titleContainer = document.getElementById("mapTitleContainer");

    // Update title container with the inputted title
    if (mapTitle) {
      titleContainer.innerText = mapTitle;
      titleContainer.style.display = "block";
    } else {
      titleContainer.style.display = "none";
    }
  });

  // Clear title part
  document.getElementById("clearTitleButton").addEventListener("click", () => {
    document.getElementById("mapTitle").value = "";
    const titleContainer = document.getElementById("mapTitleContainer");
    if (titleContainer) {
      titleContainer.style.display = "none";
    }
  });

  // Export to PDF functionality
  document.getElementById("exportButton").addEventListener("click", function () {
    const mapTitleContainer = document.getElementById("mapTitleContainer");
    const mapDiv = document.getElementById("map_div");

    // Create a temporary wrapper to hold both title and map
    const exportContent = document.createElement("div");
    exportContent.appendChild(mapTitleContainer.cloneNode(true));
    exportContent.appendChild(mapDiv.cloneNode(true));

    html2pdf().from(exportContent).save();
  });

  // export to png file
  document.getElementById('exportPngButton').addEventListener('click', function () {
    const mapTitleContainer = document.getElementById("mapTitleContainer");
    const mapDiv = document.getElementById("map_div");

    // Create a temporary wrapper to hold both title and map
    const exportContent = document.createElement("div");
    exportContent.appendChild(mapTitleContainer.cloneNode(true));
    exportContent.appendChild(mapDiv.cloneNode(true));
    
      // Append the exportContent to the body
      document.body.appendChild(exportContent);

    setTimeout(() => {
      domtoimage.toPng(exportContent)
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'exported-image.png';
            link.click();
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        })
        .finally(() => {
          document.body.removeChild(exportContent);
        })
    } , 1000)
  });

  // export to svg file
  document.getElementById('exportSvgButton').addEventListener('click', function () {
    const mapTitleContainer = document.getElementById("mapTitleContainer");
    const mapDiv = document.getElementById("map_div");

    // Create a temporary wrapper to hold both title and map
    const exportContent = document.createElement("div");
    exportContent.appendChild(mapTitleContainer.cloneNode(true));
    exportContent.appendChild(mapDiv.cloneNode(true));
    
     // Append the exportContent to the body
     document.body.appendChild(exportContent);

    setTimeout(() => {
      domtoimage.toSvg(exportContent)
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'exported-image.svg';
            link.click();
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
        })
        .finally(() => {
          document.body.removeChild(exportContent);
        })
    }, 1000);
    
  });

  // Add row functionality
  document.getElementById("addRowButton").addEventListener("click", function () {
    var newRow = { Name: "", State: "" };
    gridOptions.api.applyTransaction({ add: [newRow] });
  });

  // Delete selected row functionality
  document.getElementById("deleteRowButton").addEventListener("click", function () {
    var selectedRow = gridOptions.api.getSelectedNodes();
    if (selectedRow.length > 0) {
      gridOptions.api.applyTransaction({ remove: selectedRow.map((node) => node.data) });
    }
  });

  // Load CSV data functionality
  document.getElementById("loadCsvButton").addEventListener("click", function () {
    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];

    if (!file) {
      alert("Please upload a CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        gridOptions.api.setRowData(results.data);
      },
    });
  });





});


