let freddyAi = 1;
let bonnieAi = 9;
let chicaAi = 8;
let foxyAi = 7;

function onChangeAI() {
    if (document.getElementById('freddy_ai').value > 20) {
        document.getElementById('freddy_ai').value = 20;
    } else if (document.getElementById('freddy_ai').value < 0) {
        document.getElementById('freddy_ai').value = 0;
    }
    if (document.getElementById('bonnie_ai').value > 20) {
        document.getElementById('bonnie_ai').value = 20;
    } else if (document.getElementById('bonnie_ai').value < 0) {
        document.getElementById('bonnie_ai').value = 0;
    }
    if (document.getElementById('chica_ai').value > 20) {
        document.getElementById('chica_ai').value = 20;
    } else if (document.getElementById('chica_ai').value < 0) {
        document.getElementById('chica_ai').value = 0;
    }
    if (document.getElementById('foxy_ai').value > 20) {
        document.getElementById('foxy_ai').value = 20;
    } else if (document.getElementById('foxy_ai').value < 0) {
        document.getElementById('foxy_ai').value = 0;
    }

    freddyAi = document.getElementById('freddy_ai').value;
    bonnieAi = document.getElementById('bonnie_ai').value;
    chicaAi = document.getElementById('chica_ai').value;
    foxyAi = document.getElementById('foxy_ai').value;
}

function startNight() {
    let URLconfig = "index.html?";
    URLconfig += "freddy=" + freddyAi + "&";
    URLconfig += "bonnie=" + bonnieAi + "&";
    URLconfig += "chica=" + chicaAi + "&";
    URLconfig += "foxy=" + foxyAi; 

    const a = document.createElement('a');
    a.href = URLconfig;
    a.click();
}