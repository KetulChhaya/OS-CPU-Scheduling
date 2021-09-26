let processObject =Array();
let chartData = [];
let chartLabels = [];
let processSchedule = [];
let myChart;

const deleteList = (id) =>{
    let newObject = processObject.filter(process=>process.id != id)
    processObject = [...newObject];
    fillTable()
}

const appendValue = (event)=>{
    event.preventDefault()
    let AT = $('#arrival_time').val()
    let BT = $('#burst_time').val()
    let form = $(".input-container")[0]
    if(AT.match(/^[0-9]+$/) && BT.match(/^[0-9]+$/)){
        let l = processObject.length
        processObject.push({
            id:`P${l+1}`,
            at:Number(AT),
            bt:Number(BT),
            st:0,
            ct:0,
            rt:0,
            wt:0,
            tat:0
        })
        form.reset()
        fillTable()
    }
    else{
        $('.toast').toast('show');
        form.reset()
    }
}

const fillTable = () =>{
    let html =""
    processObject.map((process,index)=>{
        html += `<tr>
                        <td scope="row" style="font-weight:bold">${process.id}</td>
                        <td>${process.at}</td>
                        <td>${process.bt}</td>
                        <td>${process.st}</td>
                        <td>${process.ct}</td>
                        <td>${process.rt}</td>
                        <td>${process.wt}</td>
                        <td>${process.tat}</td>
                        <td><button class="btn btn-danger p-1" style="position: inherit;" onclick="deleteList('${process.id}')"><i class="bi bi-archive"></i></button></td>
                    </tr>`
        })
        $("#tableBody").empty()
        $("#tableBody").append(html)
}

const play = (event) =>{

    if(processObject.length ==0){
        $('.toast').toast('show');
        return false;
    }

    event.preventDefault()
    chartData = []
    chartLabels = []
    processSchedule = []
    let avgTAT = 0
    let avgWT=0
    let avgRT=0

    let canvas = document.getElementById('myChart');
    ctx = document.getElementById('myChart').getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if(myChart){
        myChart.destroy();
    }

    processObject.sort((a, b) => {
        return a.at - b.at;
    });

    for(let i=0;i<processObject.length;i++){
        if(i==0){
            processObject[i].st = processObject[i].at
        }
        else{
            if(processObject[i-1].ct >= processObject[i].at){
                processObject[i].st = processObject[i-1].ct
            }
            else{
                processObject[i].st = processObject[i].at
            }
            
        }
        processObject[i].ct = processObject[i].st+processObject[i].bt
        processObject[i].rt = processObject[i].st-processObject[i].at
        processObject[i].tat = processObject[i].ct-processObject[i].at
        processObject[i].wt = processObject[i].tat-processObject[i].bt
        avgTAT += processObject[i].tat
        avgWT += processObject[i].wt
        avgRT += processObject[i].rt
    }
    processSchedule = [...processObject]
    avgTAT = avgTAT/processObject.length
    avgWT = avgWT/processObject.length
    avgRT = avgRT/processObject.length



    processObject.sort((a, b) => {
        return Number(a.id.slice(1)) - Number(b.id.slice(1));
    });

    processObject.map(process=>{
        chartData.push(process.tat)
        chartLabels.push(process.id)
    })

    let html = `<h4>Average TAT: ${avgTAT.toFixed(2)}</h4><h4>Average WT: ${avgWT.toFixed(2)}</h4><h4>Average RT: ${avgRT.toFixed(2)}</h4>`

    $("#ans").html("")
    $("#ans").append(html)

    fillTable()
    processTable()
    makeGraph()
    $('.title-cont').css({display:"block"})
}

const processTable = () => {
    let html =`
        <table>
            <thead>
                <tr>
                    <th scope="col">Start Time</th>`
                    
    for(let i =0;i<processSchedule.length;i++){
        html += `<th scope="col">${processSchedule[i].id}</th>`;
    }

    html += `   </tr>
            </thead>
            <tbody>
                <tr><td>${processSchedule[0].st}</td>`;

    for(let i =0;i<processSchedule.length;i++){
        html += `<td>${processSchedule[i].ct}</td>`;
    }

    html +=    `</tr>
            </tbody>
        </table>
    `
    $("#process").html("")
    $("#process").append(html)
}

const makeGraph = () =>{
    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels:chartLabels,
            datasets: [{
                label:"TAT",
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        beginAtZero: true
                    }
                }],
                x: {
                    stacked:true,
                }
            },
        }
    });

}