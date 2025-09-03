const yChange = document.getElementById("y_change");

yChange.addEventListener("keyup", e => {
    if (!yChange.value.match(/\d/) && -5 < parseFloat(yChange.value) < 3) {
        yChange.value = "";
    }
})