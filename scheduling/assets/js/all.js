let processObject =Array();
let processObject1 =Array();
let processObject3 =Array();
let processObject4 =Array();
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
    if(AT.match(/^[0-9]+$/) && BT.match(/^[0-9]+$/) ){
        let l = processObject.length
        processObject.push({
            id:`P${l+1}`,
            at:Number(AT),
            bt:Number(BT),
            st:0,
            ct:0,
            rt:0,
            wt:0,
            tat:0,
            tembt:Number(BT)
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
                        <td><button class="btn btn-danger p-1" style="position: inherit;" onclick="deleteList('${process.id}')"><i class="bi bi-archive"></i></button></td>
                    </tr>`
        })
        $("#tableBody").empty()
        $("#tableBody").append(html)
}

const play = (event) =>{
    $("#ans").html("")
    chartData = []
    chartLabels = []
    processObject1 = [...processObject]
    processObject3 = [...processObject]
    processObject4 = [...processObject]
    play1(event)
    play2(event)
    play3(event)

    let QT = $('#time_quantum').val()


    if(processObject.length == 0 || !QT.match(/^[0-9]+$/)){
        $('.toast').toast('show');
        return false;
    }

    event.preventDefault()

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

    const sumall = processObject.map(item => item.bt).reduce((prev, curr) => prev + curr, 0);

    console.log(sumall)
    
    let steps =Number(QT);
    let k = 0

    let idArr = []
    let ctArr = []

    while(steps<sumall+Number(QT)){
        
        if(processObject[k].tembt !== 0){
            idArr.push(processObject[k].id)
            processObject[k].ct = steps
            let neg = processObject[k].tembt - Number(QT)
            
            if(processObject[k].tembt - Number(QT) < 0){
                processObject[k].ct += neg
                processObject[k].tembt = 0
                steps += neg
                
            }else{
                
                 processObject[k].tembt -= Number(QT)
            }
            if(processObject.length != k+1){
                if(processObject[k+1].st == 0 && processObject[k+1].at <= steps){
                    processObject[k+1].st = steps
                }
            }
                ctArr.push(steps)
                steps+=Number(QT)
            
        }     
        
        
        console.log(processObject[k].id, processObject[k].st,processObject[k].ct,steps)
        if(processObject.length == k+1){
            k=0;
        }else{
            if(processObject[k+1].at <= steps-Number(QT)){
                k++
            }
        }
        
        
    }

    

    console.log(processObject)


    for(let i=0;i<processObject.length;i++){
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

    

    let html = `<h4>Average TAT RR: ${avgTAT.toFixed(2)}</h4><h4>Average WT RR: ${avgWT.toFixed(2)}</h4><h4>Average RT RR: ${avgRT.toFixed(2)}</h4>`;

    chartData.push(avgTAT.toFixed(2))
    chartLabels.push("TAT RR")
    chartData.push(avgWT.toFixed(2))
    chartLabels.push("WT RR")
    chartData.push(avgRT.toFixed(2))
    chartLabels.push("RT RR")
    $("#ans").append(html)

    makeGraph("TAT")
    $('.title-cont').css({display:"block"})
}

const play1 = (event) =>{

    event.preventDefault()
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

    processObject1.sort((a, b) => {
        return a.at - b.at;
    });

    for(let i=0;i<processObject1.length;i++){
        if(i==0){
            processObject1[i].st = processObject1[i].at
        }
        else{
            if(processObject1[i-1].ct >= processObject1[i].at){
                processObject1[i].st = processObject1[i-1].ct
            }
            else{
                processObject1[i].st = processObject1[i].at
            }
            
        }
        processObject1[i].ct = processObject1[i].st+processObject1[i].bt
        processObject1[i].rt = processObject1[i].st-processObject1[i].at
        processObject1[i].tat = processObject1[i].ct-processObject1[i].at
        processObject1[i].wt = processObject1[i].tat-processObject1[i].bt
        avgTAT += processObject1[i].tat
        avgWT += processObject1[i].wt
        avgRT += processObject1[i].rt
    }
    processSchedule = [...processObject1]
    avgTAT = avgTAT/processObject1.length
    avgWT = avgWT/processObject1.length
    avgRT = avgRT/processObject1.length



    chartData.push(avgTAT.toFixed(2))
    chartLabels.push("TAT FCFS")
    chartData.push(avgWT.toFixed(2))
    chartLabels.push("WT FCFS")
    chartData.push(avgRT.toFixed(2))
    chartLabels.push("RT FCFS")

    let html = `<h4>Average TAT FCFS: ${avgTAT.toFixed(2)}</h4><h4>Average WT FCFS: ${avgWT.toFixed(2)}</h4><h4>Average RT FCFS: ${avgRT.toFixed(2)}</h4>`

    $("#ans").append(html)

    $('.title-cont').css({display:"block"})
}

const play2 = (event) =>{



    event.preventDefault()

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

    processObject3.sort((a, b) => {
        return a.at - b.at || b.bt - a.bt;
    });
    let ct =processObject3[0].bt
    for(let i =1; i<processObject3.length;i++){
        ct += processObject3[i].bt
        for(let j=i+1;j<processObject3.length;j++){
            if(processObject3[i].bt<processObject3[j].bt && processObject3[j].at<=ct){
                let tmp = processObject3[i]
                processObject3[i] = processObject3[j]
                processObject3[j] = tmp;
            }
        }
    }

    console.log(processObject3);

    for(let i=0;i<processObject3.length;i++){
        if(i==0){
            processObject3[i].st = processObject3[i].at
        }
        else{
            if(processObject3[i-1].ct >= processObject3[i].at){
                processObject3[i].st = processObject3[i-1].ct
            }
            else{
                processObject3[i].st = processObject3[i].at
            }
            
        }
        processObject3[i].ct = processObject3[i].st+processObject3[i].bt
        processObject3[i].rt = processObject3[i].st-processObject3[i].at
        processObject3[i].tat = processObject3[i].ct-processObject3[i].at
        processObject3[i].wt = processObject3[i].tat-processObject3[i].bt
        avgTAT += processObject3[i].tat
        avgWT += processObject3[i].wt
        avgRT += processObject3[i].rt
    }
    processSchedule = [...processObject3]
    avgTAT = avgTAT/processObject3.length
    avgWT = avgWT/processObject3.length
    avgRT = avgRT/processObject3.length



    let html = `<h4>Average TAT LJF: ${avgTAT.toFixed(2)}</h4><h4>Average WT LJF: ${avgWT.toFixed(2)}</h4><h4>Average RT LJF: ${avgRT.toFixed(2)}</h4>`
    chartData.push(avgTAT.toFixed(2))
    chartLabels.push("TAT LJF")
    chartData.push(avgWT.toFixed(2))
    chartLabels.push("WT LJF")
    chartData.push(avgRT.toFixed(2))
    chartLabels.push("RT LJF")
    $("#ans").append(html)

    $('.title-cont').css({display:"block"})
}

const play3 = (event) =>{


    event.preventDefault()
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

    processObject4.sort((a, b) => {
        return a.at - b.at || a.bt - b.bt;
    });
    let ct =processObject4[0].bt
    for(let i =1; i<processObject4.length;i++){
        ct += processObject4[i].bt
        for(let j=i+1;j<processObject4.length;j++){
            if(processObject4[i].bt>processObject4[j].bt && processObject4[j].at<=ct){
                let tmp = processObject4[i]
                processObject4[i] = processObject4[j]
                processObject4[j] = tmp;
            }
        }
    }

    console.log(processObject4);

    for(let i=0;i<processObject4.length;i++){
        if(i==0){
            processObject4[i].st = processObject4[i].at
        }
        else{
            if(processObject4[i-1].ct >= processObject4[i].at){
                processObject4[i].st = processObject4[i-1].ct
            }
            else{
                processObject4[i].st = processObject4[i].at
            }
            
        }
        processObject4[i].ct = processObject4[i].st+processObject4[i].bt
        processObject4[i].rt = processObject4[i].st-processObject4[i].at
        processObject4[i].tat = processObject4[i].ct-processObject4[i].at
        processObject4[i].wt = processObject4[i].tat-processObject4[i].bt
        avgTAT += processObject4[i].tat
        avgWT += processObject4[i].wt
        avgRT += processObject4[i].rt
    }
    processSchedule = [...processObject4]
    avgTAT = avgTAT/processObject4.length
    avgWT = avgWT/processObject4.length
    avgRT = avgRT/processObject4.length





    chartData.push(avgTAT.toFixed(2))
    chartLabels.push("TAT SJF")
    chartData.push(avgWT.toFixed(2))
    chartLabels.push("WT SJF")
    chartData.push(avgRT.toFixed(2))
    chartLabels.push("RT SJF")

    let html = `<h4>Average TAT SJF: ${avgTAT.toFixed(2)}</h4><h4>Average WT SJF: ${avgWT.toFixed(2)}</h4><h4>Average RT SJF: ${avgRT.toFixed(2)}</h4>`

 
    $("#ans").append(html)

    $('.title-cont').css({display:"block"})
}


const processTable = (idArr,ctArr) => {
    let html =`
        <table>
            <thead>
                <tr>
                    <th scope="col">Start Time</th>`
                    
    for(let i =0;i<idArr.length;i++){
        html += `<th scope="col">${idArr[i]}</th>`;
    }

    html += `   </tr>
            </thead>
            <tbody>
                <tr><td>${processSchedule[0].st}</td>`;

    for(let i =0;i<ctArr.length;i++){
        html += `<td>${ctArr[i]}</td>`;
    }

    html +=    `</tr>
            </tbody>
        </table>
    `
    $("#process").html("")
    $("#process").append(html)
}

const changeGraph = (event)=>{
    myChart.destroy();
    makeGraph(event.target.value)
}

const makeGraph = (type) =>{
    console.log(chartData);
    let finalData = [];
    let finalLabel = [];

    chartLabels.map((label,index)=>{
        if(label.indexOf(type)>-1){
            finalLabel.push(label);
            finalData.push(chartData[index])
        }
    })
    var ctx = document.getElementById('myChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels:finalLabel,
            datasets: [{
                label:type,
                data: finalData,
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