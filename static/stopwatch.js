let startBtn = document.getElementById('startSessionBtn');
let stopBtn = document.getElementById('stopSessionBtn');
let resetBtn = document.getElementById('stopSessionBtn');

let hour = 0;
let minute = 0;
let second = 0;


startBtn.addEventListener('click', function () {
    timer = true;
    stopWatch();
});

stopBtn.addEventListener('click', function () {
    timer = false;
});


function resetStopwatch() {
    // timer = false;
    hour = 0;
    minute = 0;
    second = 0;
    count = 0;
    document.getElementById('hr').innerHTML = "00";
    document.getElementById('min').innerHTML = "00";
    document.getElementById('sec').innerHTML = "00";
    // timer = true;
    // stopWatch()
}


resetBtn.addEventListener('click', function () {
    timer = false;
    hour = 0;
    minute = 0;
    second = 0;
    count = 0;
    document.getElementById('hr').innerHTML = "00";
    document.getElementById('min').innerHTML = "00";
    document.getElementById('sec').innerHTML = "00";
});

function stopWatch() {

    if (timer) {
        second++;

        if (second == 60) {
            minute++;
            second = 0;
        }

        if (minute == 60) {
            hour++;
            minute = 0;
            second = 0;
        }

        let hrString = hour;
        let minString = minute;
        let secString = second;

        if (hour < 10) {
            hrString = "0" + hrString;
        }

        if (minute < 10) {
            minString = "0" + minString;
        }

        if (second < 10) {
            secString = "0" + secString;
        }

        document.getElementById('sec').innerHTML = secString;
        document.getElementById('min').innerHTML = minString;
        document.getElementById('hr').innerHTML = hrString;
        setTimeout(stopWatch, 1000);
    }
}