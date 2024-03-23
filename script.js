function selectFromWhereBasic() {
    var num = document.getElementById("num").value;
    var ra_min = document.getElementById("ra_min").value;
    var ra_max = document.getElementById("ra_max").value;
    var dec_min = document.getElementById("dec_min").value;
    var dec_max = document.getElementById("dec_max").value;
    var table = document.getElementById("table").value;

    var query = "SELECT TOP " + num + " objID, ra, dec FROM " + table +
        " WHERE ra > " + ra_min + " and ra < " + ra_max +
        " AND dec > " + dec_min + " and dec < " + dec_max;

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
            // Display the JSON string
            document.getElementById("apiResponse").innerText = data;

            if (outputFormat === 'csv') {
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
