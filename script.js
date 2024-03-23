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

    querySDSSApi(query);
}

function querySDSSApi(query) {

    fetch('http://skyserver.sdss.org/dr16/SkyServerWS/SearchTools/SqlSearch?cmd=' + encodeURIComponent(query))
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById("apiResponse").innerHTML = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error('Error making the API call:', error);
            document.getElementById("apiResponse").innerHTML = "Error: " + error;
        });
}