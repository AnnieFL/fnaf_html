let stopRender = false;

let cameraUp = false;
let currentCam = 0;

let camPositions = ['1A', '1B', '1C', '3', '5', '6', '7', '2A', '2B', '4A', '4B'];

let bonniePos = 0;
let chicaPos = 0;
let freddyPos = 0;
let foxyPos = 0;

let leftDoorClosed = false;
let leftLightOn = false;

let rightDoorClosed = false;
let rightLightOn = false;

let bonnieDeath = false;
let chicaDeath = false;
let foxyDeath = false;
let freddyDeath = false;

const BONNIE_AI = 0;
const CHICA_AI = 0;
const FOXY_AI = 20;
const FREDDY_AI = 0;

let foxyStall = randomRange(500, 1000);
let foxyRunning = false;
let foxyJumpscareStall = 0;
let foxyTimeoutSet = false;
let gifPlaying;

let freddyAttackMode = false;
let freddyTimer = Math.max(1, 10000 - (FREDDY_AI * 1000));

let powerPercentage = 100;
const CURRENT_NIGHT = 7;
let currentTime = 12;
let timeCount = 0;
let passivePowerDrain = 0;
let dead = false;
let win = false;

if (CURRENT_NIGHT == 2) {
    passivePowerDrain = 0.00016;
} else if (CURRENT_NIGHT == 3) {
    passivePowerDrain = 0.0002;
} else if (CURRENT_NIGHT == 4) {
    passivePowerDrain = 0.00025;
} else if (CURRENT_NIGHT >= 5) {
    passivePowerDrain = 0.00033;
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function playAudio(file, options = {}) {
    const audio = document.createElement("audio");
    audio.autoplay = true;
    audio.src = file;
    audio.type = 'audio/mp3';

    const id = `${Math.random() * 999}`
    audio.id = id;

    document.appendChild(audio);

    setTimeout(() => {
        audio.remove();
    }, 5000)

}

function stopAudio(name) {

}

function toggleDoor(side) {
    if (side == 'left' && !bonnieDeath) {
        leftDoorClosed = !leftDoorClosed;
        document.getElementById('left_door').classList.remove('invisible');
        document.getElementById('left_door').classList.toggle('open_door');
        document.getElementById('left_door').classList.toggle('close_door');
    } else if (side == 'right' && !chicaDeath) {
        rightDoorClosed = !rightDoorClosed;
        document.getElementById('right_door').classList.remove('invisible');
        document.getElementById('right_door').classList.toggle('open_door');
        document.getElementById('right_door').classList.toggle('close_door');
    }
    if ((side === 'left' && !bonnieDeath) || side === 'right' && !chicaDeath) {
        playAudio('./noises/door_slam.mp3');
    } else {
        //playAudio('./noises/dud.mp3');
    }
}

function toggleLight(side) {
    if (side == 'left' && !bonnieDeath) {
        rightLightOn = false;
        leftLightOn = !leftLightOn;
        //playAudio('./noises/light.mp3');
    } else if (side == 'right' && !chicaDeath) {
        leftLightOn = false;
        rightLightOn = !rightLightOn;
        //playAudio('./noises/light.mp3');
    } else {
        leftLightOn = false;
        rightLightOn = false;
        //playAudio('./noises/dud.mp3');
    }
}

function toggleCamera() {
    //playAudio('./noises/camera_flip.mp3');
    const img = document.createElement("img");
    img.src = './screens/monitor_test.webp';

    const id = `${Math.random() * 999}`
    img.id = id;

    document.getElementById('camera_animation').appendChild(img);

    setTimeout(() => {
        img.remove();
        cameraUp = !cameraUp;

        document.getElementById('camera_map').classList.toggle('none');
        document.getElementById('left_door').classList.toggle('invisible');
        document.getElementById('right_door').classList.toggle('invisible');
        document.getElementById('left_buttons').classList.toggle('none');
        document.getElementById('right_buttons').classList.toggle('none');
    }, 700)
}

function changeCamera(camera) {
    //playAudio('./noises/camera_swap.mp3');
    document.getElementById(`cam${camPositions[currentCam]}`).classList.remove('active_cam');

    currentCam = camera;

    document.getElementById(`cam${camPositions[currentCam]}`).classList.add('active_cam');
}

function randomBonnie() {
    setTimeout(() => {
        if (Math.random() * 20 <= BONNIE_AI) {
            if (bonniePos == -1 && !leftDoorClosed) {
                leftLightOn = false;
                bonnieDeath = true;
            } else if (bonniePos == -1 && leftDoorClosed) {
                bonniePos = 1;
            } else {
                if (bonniePos == 0) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 1 : 4;
                } else if (bonniePos == 1) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 4 : 7;
                } else if (bonniePos == 4) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 1 : 7;
                } else if (bonniePos == 7) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 3 : 8;
                } else if (bonniePos == 3) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 7 : -1;
                } else if (bonniePos == 8) {
                    bonniePos = Math.floor(Math.random() * 2) % 2 == 0 ? 3 : -1;
                }
            }
        }
        randomBonnie();
    }, randomRange(4000, 5000))
}

function randomChica() {
    setTimeout(() => {
        if (Math.random() * 20 <= CHICA_AI) {
            if (chicaPos == -1 && !rightDoorClosed) {
                rightLightOn = false;
                //chicaDeath = true;
            } else if (chicaPos == -1 && rightDoorClosed) {
                chicaPos = 9;
            } else {
                if (chicaPos == 0 && bonniePos != 0) {
                    chicaPos = 1;
                } else if (chicaPos == 1) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 6 : 5;
                    if (chicaPos == 5) {
                        //playAudio('./noises/pots_pans.mp3', {repeat: 'pots_pans'})
                    }
                } else if (chicaPos == 5) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 6 : 9;
                    //stopAudio('pots_pans')
                } else if (chicaPos == 5) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 5 : 9;
                    if (chicaPos == 5) {
                        //playAudio('./noises/pots_pans.mp3', {repeat: 'pots_pans'})
                    }
                } else if (chicaPos == 9) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 10 : 1;
                } else if (chicaPos == 10) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 9 : -1;
                }
            }
        }
        randomChica();
    }, randomRange(4000, 5000))
}

function randomFoxy() {
    setTimeout(() => {
        if (Math.random() * 20 <= FOXY_AI && (foxyStall == 0 || foxyRunning)) {
            foxyPos = Math.min(3, foxyPos + 1);

            if (foxyPos == 3 && !foxyTimeoutSet) {
                if (!foxyRunning) {
                    foxyRunning = true;
                } else if (!leftDoorClosed) {
                    if (foxyJumpscareStall > 0) {
                        setTimeout(() => {
                            if (!leftDoorClosed) {
                                foxyDeath = true;
                            } else {
                                foxyRunning = false;
                                foxyPos = 0;
                                foxyJumpscareStall = 0;
                                foxyTimeoutSet = false;
                            }
                        }, foxyJumpscareStall);
                        foxyTimeoutSet = true;
                    } else {
                        foxyDeath = true;
                    }
                } else {
                    foxyRunning = false;
                    foxyPos = 0;
                    foxyJumpscareStall = 0;
                }
            }
        }
        randomFoxy();
    }, 4000)
}

function randomFreddy() {
    let timer;
    if (freddyAttackMode) {
        timer = freddyTimer;
    } else {
        timer = randomRange(4000, 5000)
    }

    setTimeout(() => {

        if ((Math.random() * 20 <= FREDDY_AI || freddyAttackMode) && !freddyDeath) {
            if (!freddyAttackMode) {
                freddyAttackMode = true;
            }

            if (freddyPos == 10 && !rightDoorClosed && cameraUp && camPositions[currentCam] != "4B") {
                freddyDeath = true;
                freddyPos = -1;
            } else {
                if (freddyPos == 0 && bonniePos != 0 && chicaPos != 0) {
                    freddyPos = 1;
                } else if (freddyPos == 1) {
                    freddyPos = 6;
                } else if (freddyPos == 6) {
                    freddyPos = 5;
                    //playAudio('./noises/kitchen_song.mp3', {repeat: 'kitchen_song'})
                } else if (freddyPos == 5) {
                    freddyPos = 9;
                    //stopAudio('pots_pans')
                } else if (freddyPos == 9) {
                    freddyPos = 10;
                }
            }
        }
        randomFreddy();
    }, timer)
}

function tryJumpscare() {
    setTimeout(() => {
        if ((chicaDeath || bonnieDeath || freddyDeath) && cameraUp || foxyDeath) {
            dead = true;
            setTimeout(() => {
                if (cameraUp) {
                    toggleCamera();
                }
                let officeImage = '';

                stopRender = true;
                document.getElementById('left_door').classList.add('invisible');
                document.getElementById('right_door').classList.add('invisible');
                document.getElementById('left_buttons').classList.add('none');
                document.getElementById('right_buttons').classList.add('none');

                if (bonnieDeath && !chicaDeath) {
                    officeImage = './screens/jumpscares/bonnie_jump.webp';
                } else if (chicaDeath && !bonnieDeath) {
                    officeImage = './screens/jumpscares/chica_jump.webp';
                } else if (chicaDeath && bonnieDeath) {
                    officeImage = Math.floor(Math.random() * 10) % 2 == 0 ? './screens/jumpscares/bonnie_jump.webp' : './screens/jumpscares/chica_jump.webp';
                } else if (foxyDeath) {
                    officeImage = './screens/jumpscares/foxy_jump.webp';
                } else if (freddyDeath) {
                    officeImage = './screens/jumpscares/freddy_jump.webp';
                }

                document.getElementById('main').src = officeImage;
                setTimeout(() => {
                    document.body.classList.add('none');
                }, 800)
            }, Math.floor(Math.random() * 3000));
        }

        if (!dead) {
            tryJumpscare();
        }
    }, 10);
}

function render() {
    setTimeout(() => {
        if (!cameraUp) {
            let leftButtonImage = "./screens/office/buttons/button_base_left.png";
            let rightButtonImage = "./screens/office/buttons/button_base_right.png";

            let officeImage = "./screens/office/office_base.png";

            if (leftDoorClosed && leftLightOn && !bonnieDeath) {
                leftButtonImage = './screens/office/buttons/button_door_light_left.png';
            } else if (leftDoorClosed) {
                leftButtonImage = './screens/office/buttons/button_door_left.png';
            } else if (leftLightOn) {
                leftButtonImage = './screens/office/buttons/button_light_left.png';
            }

            if (rightDoorClosed && rightLightOn && !chicaDeath) {
                rightButtonImage = './screens/office/buttons/button_door_light_right.png';
            } else if (rightDoorClosed) {
                rightButtonImage = './screens/office/buttons/button_door_right.png';
            } else if (rightLightOn) {
                rightButtonImage = './screens/office/buttons/button_light_right.png';
            }

            if (leftLightOn) {
                if (bonniePos == -1) {
                    officeImage = './screens/office/office_bonnie.png';
                } else {
                    officeImage = './screens/office/office_left.png';
                }
            } else if (rightLightOn) {
                if (chicaPos == -1) {
                    officeImage = './screens/office/office_chica.png';
                } else {
                    officeImage = './screens/office/office_right.png';
                }
            }

            if ((leftLightOn || rightLightOn) && Math.random() * 20 <= 2) {
                officeImage = './screens/office/office_base.png';
            }
            gifPlaying = false;

            document.getElementById('left_buttons').src = leftButtonImage;
            document.getElementById('right_buttons').src = rightButtonImage;
            document.getElementById('main').src = officeImage;
        } else {
            let currentScreen = `./screens/${camPositions[currentCam]}/cam`;
            foxyStall = randomRange(500, 1000);

            if (camPositions[currentCam] == '1C') {
                currentScreen += `_foxy${foxyPos}`;
                gifPlaying = false;
            } else if (camPositions[currentCam] == '2A' && foxyPos == 3 && foxyRunning) {
                if (foxyJumpscareStall == 0) {
                    //playAudio("./noises/schmoove.mp3");
                    foxyJumpscareStall = 1000;
                    gifPlaying = true;
                    currentScreen += `_foxy_schmoovin.webp`;
                    document.getElementById('main').src = currentScreen;
                } else if (foxyJumpscareStall > 550) {
                    foxyJumpscareStall -= 10;
                    gifPlaying = true;
                } else {
                    gifPlaying = false;
                }

            } else if (camPositions[currentCam] != '6') {
                if (bonniePos == currentCam) {
                    currentScreen += "_bonnie";
                }
                if (chicaPos == currentCam) {
                    currentScreen += "_chica";
                }
                if (freddyPos == currentCam) {
                    currentScreen += "_freddy";
                }
                gifPlaying = false;
            }

            if (!gifPlaying) {
                currentScreen += ".png";
                document.getElementById('main').src = currentScreen;
            }
        }

        document.getElementById("debug_txt").innerText = foxyJumpscareStall + "\n" + foxyPos;

        document.getElementById('power_percentage').innerText = Math.floor(powerPercentage) + "%";
        document.getElementById('current_night').innerText = "Night " + CURRENT_NIGHT;
        document.getElementById('current_time').innerText = currentTime + "AM";

        if (!dead) {
            if (foxyStall > 0) {
                foxyStall--;
            }
            if (powerPercentage > 0) {
                let powerDrain = passivePowerDrain;

                if (leftDoorClosed) {
                    powerDrain += 0.0001;
                }
                if (rightDoorClosed) {
                    powerDrain += 0.0001;
                }
                if (leftLightOn) {
                    powerDrain += 0.0001;
                }
                if (rightLightOn) {
                    powerDrain += 0.0001;
                }

                powerPercentage -= passivePowerDrain;
            }
            if (timeCount > 9000) {
                if (currentTime == 12) {
                    currentTime = 1;
                    timeCount = 0;
                } else if (currentTime != 6) {
                    currentTime++;
                    timeCount = 0;
                } else {
                    win = true;
                }
            } else {
                timeCount++;
            }

            render();
        }
    }, 10)
}

render();
tryJumpscare();
randomBonnie();
randomChica();
randomFoxy();
randomFreddy();