function selectFromWhereBasic() {
    var num = document.getElementById("num").value;
    var ra_min = document.getElementById("ra_min").value;
    var ra_max = document.getElementById("ra_max").value;
    var dec_min = document.getElementById("dec_min").value;
    var dec_max = document.getElementById("dec_max").value;
    var table = document.getElementById("table").value;
    var galaxiesChecked = document.getElementById("galaxies").checked;
    var starsChecked = document.getElementById("stars").checked;
    var excludeUnknownChecked = document.getElementById("excludeUnknown").checked;

    var magnitudeChecked = document.getElementById("magnitude").checked;
    var fluxChecked = document.getElementById("flux").checked;

    var uChecked = document.getElementById("u").checked;
    var gChecked = document.getElementById("g").checked;
    var rChecked = document.getElementById("r").checked;
    var iChecked = document.getElementById("i").checked;
    var zChecked = document.getElementById("z").checked;

    var objectTypes = [];
    if (galaxiesChecked) {
        objectTypes.push("type = 3"); // Galaxy
    }
    if (starsChecked) {
        objectTypes.push("type = 6"); // Star
    }
    if (excludeUnknownChecked) {
        objectTypes.push("type != 0"); // Exclude unknown objects
    }

    var objectTypeCondition = "";
    if (objectTypes.length > 0) {
        objectTypeCondition = "(" + objectTypes.join(" OR ") + ")";
    } else {
        // No checkbox is checked, return empty query
        document.getElementById("query").innerHTML = "No checkbox is checked. Please select at least one checkbox.";
        return;
    }

    var filters = [];
    if (uChecked) {
        if (magnitudeChecked) filters.push("psfMag_u");
        if (fluxChecked) filters.push("psfFlux_u");
    }
    if (gChecked) {
        if (magnitudeChecked) filters.push("psfMag_g");
        if (fluxChecked) filters.push("psfFlux_g");
    }
    if (rChecked) {
        if (magnitudeChecked) filters.push("psfMag_r");
        if (fluxChecked) filters.push("psfFlux_r");
    }
    if (iChecked) {
        if (magnitudeChecked) filters.push("psfMag_i");
        if (fluxChecked) filters.push("psfFlux_i");
    }
    if (zChecked) {
        if (magnitudeChecked) filters.push("psfMag_z");
        if (fluxChecked) filters.push("psfFlux_z");
    }

    var selectedFilters = filters.join(", ");

    var query = "SELECT TOP " + num + " objID, ra, dec " + selectedFilters + " FROM " + table +
        " WHERE ra > " + ra_min + " and ra < " + ra_max +
        " AND dec > " + dec_min + " and dec < " + dec_max;
    
    query += " AND " + objectTypeCondition;

    document.getElementById("query").innerHTML = query;

    // Radio button selection for output type (HTML or CSV)
    var outputFormat = document.querySelector('input[name="outputFormat"]:checked').value;

    querySDSSApi(query, outputFormat);
}

function querySDSSApi(query, outputFormat) {
    var url = 'https://skyserver.sdss.org/dr18/SkyServerWS/SearchTools/SqlSearch?cmd=' + encodeURIComponent(query);

    fetch(url)
        .then(response => {
            if(!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            if(outputFormat === 'json'){
                document.getElementById("apiResponse").innerText = data;
            }
            else if (outputFormat === 'csv') {
                downloadCSV(data);
            } else {
                // Display the table
                var tableHtml = createTableFromJson(data);
                document.getElementById("apiResponseTable").innerHTML = tableHtml;
            }
        })
        .catch(error => {
            console.error('Error making the API call:', error);
            document.getElementById("apiResponse").innerHTML = "Error: " + error;
        });
}


function downloadCSV(jsonData) {
    // Parse the JSON response
    var data = JSON.parse(jsonData);

    // Extract rows of data
    var rows = [];
    for (var i = 0; i < data.length; i++) {
        var tableName = data[i].TableName;
        var tableRows = data[i].Rows;
        for (var j = 0; j < tableRows.length; j++) {
            rows.push(tableRows[j]);
        }
    }

    // Extract columns and build CSV string
    var csv = '';
    if (rows.length > 0) {
        var columns = Object.keys(rows[0]);
        csv += columns.join(',') + '\n';
        for (var i = 0; i < rows.length; i++) {
            var row = [];
            for (var j = 0; j < columns.length; j++) {
                row.push(rows[i][columns[j]]);
            }
            csv += row.join(',') + '\n';
        }
    }

    // Download the CSV file
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sdss_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function createTableFromJson(jsonData) {
    jsonData = JSON.parse(jsonData)
    var html = "";

    jsonData.forEach(table => {
        html += "<h3>" + table.TableName + "</h3>";
        html += "<table border='1'>";
        var columnSet = [];

        if (table.Rows.length > 0) {
            html += "<tr>";
            for (var key in table.Rows[0]) {
                if (table.Rows[0].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                    columnSet.push(key);
                    html += "<th>" + key + "</th>";
                }
            }
            html += "</tr>";
        }

        table.Rows.forEach(row => {
            html += "<tr>";
            columnSet.forEach(column => {
                html += "<td>" + row[column] + "</td>";
            });
            html += "</tr>";
        });

        html += "</table><br>";
    });

    return html;
}
