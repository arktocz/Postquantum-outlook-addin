// Declare a global variable to store the file content
let fileContent = "";

// Attach event listener to the file input
document.getElementById("inputfile").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        fileContent = reader.result;  // Store content in global variable
        console.log(fileContent); // Log content to the console
        document.getElementById("output").textContent = fileContent;
    };

    reader.onerror = function () {
        console.error("Error reading file:", reader.error);
    };

    reader.readAsText(file);
});