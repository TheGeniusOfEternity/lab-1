const yChange = document.getElementById("y_change");
const xChange = document.getElementById("x_change");
const table = document.getElementById("table");
const inputForm = document.getElementById("inputForm")
let yPrevValue = ""

const validate = (x, y, r) => {
    if (isNaN(x) || isNaN(y) || isNaN(r)) return false
    return (-2 <= x && x <= 2 &&
        -5 < y && y < 3 &&
        1 <= r <= 5
    )
}

const send = async (x, y, r) => {
    const jsonStr = JSON.stringify({
        x: x,
        y: y,
        r: r
    })

    const response = await fetch("http://localhost:46737/fcgi-bin/", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
        },
        body: jsonStr,
    })
    const json = await response.json()
    let localData = JSON.parse(localStorage.getItem('localData'))
    if (localData) localData.push(json)
    else localData = [json]
    localStorage.setItem('localData', JSON.stringify(localData))
    parseResults()
}

const addRow = (json) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${json.x}</td>
            <td>${json.y}</td>
            <td>${json.r}</td>
            <td>${json.result ? 'Успех' : 'Провал'}</td>
            <td>${json.currentTime ? json.currentTime : 'Неизвестно'}</td>
            <td>${json.executionTime ? json.executionTime : 'Неизвестно'}</td>
            `;
    table.appendChild(tr);
}

const parseResults= () =>  {
    table.innerHTML = `
        <tr>
            <th>Коорд. X</th>
            <th>Коорд. Y</th>
            <th>Радиус R</th>
            <th>Факт попадания в область</th>
            <th>Текущее время</th>
            <th>Время выполнения скрипта (ms)</th>
        </tr>`
    const results = JSON.parse(localStorage.getItem('localData'))
    if (results) results.forEach(result => addRow(result))
}

window.onload = () => parseResults()

yChange.addEventListener("input", () => {
    const regex = /^(-|-?\d|-?\d\.\d{0,3}|)$/
    if (!regex.test(yChange.value) && yChange.value !== "" || yChange.value === "-0")
        yChange.value = yPrevValue
    const num = parseFloat(yChange.value)
    if ((isNaN(num) || -5 >= num || num >= 3) && !yChange.value.match(/^-?$/))
        yChange.value = yPrevValue
    yPrevValue = yChange.value
})

inputForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const rChange = document.querySelector('input[name="r_change"]:checked')
    const x = parseFloat(xChange.value)
    const y = parseFloat(yChange.value)
    const r = parseInt(rChange.value)

    if (validate(x, y, r))
        await send(x, y, r)
    else console.log("hi")
})



