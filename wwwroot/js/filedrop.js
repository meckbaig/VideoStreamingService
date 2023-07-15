var files;
function handleDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    var dropZone = document.getElementById('drop_zone');
    dropZone.innerHTML = "Drop now";
}

function handleDnDFileSelect(event) {
    event.stopPropagation();
    event.preventDefault();

    /* Read the list of all the selected files. */
    files = event.dataTransfer.files;

    /* Consolidate the output element. */
    var form = document.getElementById('form1');
    var data = new FormData(form);

    for (var i = 0; i < files.length; i++) {
        data.append(files[i].name, files[i]);
    }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText) {
            alert("upload done!");
        } else {
        }
    };
    xhr.open('POST', "Upload.aspx");
    xhr.send(data);

}