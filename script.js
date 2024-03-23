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
    var url = 'http://skyserver.sdss.org/dr16/SkyServerWS/SearchTools/SqlSearch?cmd=' + encodeURIComponent(query);
    
    fetch(url)
        .then(response => {
            if(!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            if (outputFormat === 'csv') {
                downloadCSV(data);
            } else {
                document.getElementById("apiResponse").innerHTML = data;
            }
        })
        .catch(error => {
            console.error('Error making the API call:', error);
            document.getElementById("apiResponse").innerHTML = "Error: " + error;
        });
}

function downloadCSV(csvData) {
    var blob = new Blob([csvData], { type: 'text/csv' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sdss_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}