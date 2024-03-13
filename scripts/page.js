// displaying the URL of the current active tab

document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url");

    document.getElementById("url-display").textContent = url;
});