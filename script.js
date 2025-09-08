const yChange = document.getElementById("y_change");
let yPrevValue = ""

yChange.addEventListener("input", () => {
    const regex = /^(-|-?\d|-?\d\.\d{0,3}|)$/
    if (!regex.test(yChange.value) && yChange.value !== "" || yChange.value === "-0")
        yChange.value = yPrevValue
    const num = parseFloat(yChange.value)
    if ((isNaN(num) || -5 >= num || num >= 3) && !yChange.value.match(/^-?$/))
        yChange.value = yPrevValue
    yPrevValue = yChange.value
})