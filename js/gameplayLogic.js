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
let freddyDarkDeath = false;

const urlParams = new URLSearchParams(window.location.search);

const BONNIE_AI = parseInt(urlParams.get("bonnie")) || null;
const CHICA_AI = parseInt(urlParams.get("chica")) || null;
const FOXY_AI = parseInt(urlParams.get("foxy")) || null;
const FREDDY_AI = parseInt(urlParams.get("freddy")) || null;

let foxyStall = randomRange(500, 1000);
let foxyRunning = false;
let foxyJumpscareStall = 0;
let foxyTimeoutSet = false;
let gifPlaying;

let freddyAttackMode = false;
let freddyTimer = Math.max(1000, 10000 - (FREDDY_AI * 1000));
let schoolSafeMode = urlParams.get("safe") == "true" || false;

let powerPercentage = 100;
const CURRENT_NIGHT = 7;
let currentTime = 12;
let timeCount = 0;
let passivePowerDrain = 0;
let dead = false;
let win = false;
let cameraBlackout = false;

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
    if (options?.volume) {
        audio.volume = options.volume;
    }

    let id = `${Math.random() * 999}`
    if (options?.repeat && !document.getElementById(options.repeat)) {
        id = options.repeat;
        audio.loop = true;
    }
    audio.id = id;

    document.body.appendChild(audio);

    setTimeout(() => {
        if (!options?.repeat) {
            audio.remove();
        }
    }, options?.duration || 5000)

}

function stopAllAudios() {
    document.querySelectorAll("audio").forEach((audio) => {
        audio.remove();
    });
}

function stopAudio(name) {
    const audio = document.getElementById(name);

    if (audio) {
        audio.remove();
    }
}

function toggleDoor(side) {
    if (win) {
        return;
    }
    if (powerPercentage > 0 || side == 'left' && leftDoorClosed || side == 'right' && rightDoorClosed) {
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
            playAudio('./noises/dud.mp3');
        }
}
}

function toggleLight(side) {
    if (win) {
        return;
    }
    if (powerPercentage > 0 || side == 'left' && leftLightOn || side == 'right' && rightLightOn) {
        stopAudio('light');
        if (side == 'left' && !bonnieDeath) {
            rightLightOn = false;
            if (!leftLightOn) {
                playAudio('./noises/light.mp3', {repeat: 'light'});
            }
            leftLightOn = !leftLightOn;
        } else if (side == 'right' && !chicaDeath) {
            leftLightOn = false;
            if (!rightLightOn) {
                playAudio('./noises/light.mp3', { repeat: 'light' });
            }
            rightLightOn = !rightLightOn;
        } else {
            leftLightOn = false;
            rightLightOn = false;

            playAudio('./noises/dud.mp3');
        }
    }
}

function toggleCamera() {
    if (win) {
        return;
    }

    if (powerPercentage > 0 || cameraUp) {
        const img = document.createElement("img");
        if (cameraUp) {
            img.src = './screens/monitor_down.webp';
        } else {
            img.src = './screens/monitor_up.webp';
        }

        const id = `${Math.random() * 999}`
        img.id = id;

        document.getElementById('camera_animation').appendChild(img);
        setTimeout(() => {
            playAudio('./noises/camera_flip.mp3');
        }, 10)

        let handleCamera;

        if (cameraUp) {
            cameraUp = false;
                        
            document.getElementById('camera_map').classList.toggle('none');
            document.getElementById('left_door').classList.toggle('invisible');
            document.getElementById('right_door').classList.toggle('invisible');
            document.getElementById('left_buttons').classList.toggle('none');
            document.getElementById('right_buttons').classList.toggle('none');

            handleCamera = function() {
                img.remove();
            }
        } else {
            handleCamera = function() {
                img.remove();
                cameraUp = true;
                        
                document.getElementById('camera_map').classList.toggle('none');
                document.getElementById('left_door').classList.toggle('invisible');
                document.getElementById('right_door').classList.toggle('invisible');
                document.getElementById('left_buttons').classList.toggle('none');
                document.getElementById('right_buttons').classList.toggle('none');
            }
        }
        setTimeout(() => {
            handleCamera();
        }, 180)

    }
}

function changeCamera(camera) {
    playAudio('./noises/camera_swap.mp3');
    document.getElementById(`cam${camPositions[currentCam]}`).classList.remove('active_cam');

    currentCam = camera;

    document.getElementById(`cam${camPositions[currentCam]}`).classList.add('active_cam');
}

function randomBonnie() {
    setTimeout(() => {
        if (Math.random() * 20 <= BONNIE_AI && powerPercentage > 0 && !win) {
            if (bonniePos == currentCam && cameraUp) {
                setCameraBlackout();
            }

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
        if (Math.random() * 20 <= CHICA_AI && powerPercentage > 0 && !win) {
            if (chicaPos == currentCam && cameraUp) {
                setCameraBlackout();
            }

            if (chicaPos == -1 && !rightDoorClosed) {
                rightLightOn = false;
                chicaDeath = true;
            } else if (chicaPos == -1 && rightDoorClosed) {
                chicaPos = 9;
            } else {
                if (chicaPos == 0 && bonniePos != 0) {
                    chicaPos = 1;
                } else if (chicaPos == 1) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 6 : 5;
                    if (chicaPos == 5) {
                        setTimeout(() => {
                            playAudio('./noises/pots_pans.mp3', { repeat: 'pots_pans', volume: 0.05 })
                        }, 10);
                    }
                } else if (chicaPos == 5) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 6 : 9;
                    stopAudio('pots_pans')
                } else if (chicaPos == 6) {
                    chicaPos = Math.floor(Math.random() * 2) % 2 == 0 ? 5 : 9;
                    if (chicaPos == 5) {
                        setTimeout(() => {
                            playAudio('./noises/pots_pans.mp3', { repeat: 'pots_pans', volume: 0.05 })
                        }, 10);
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
        if (Math.random() * 20 <= FOXY_AI && (foxyStall == 0 || foxyRunning) && powerPercentage > 0 && !win) {
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
                                powerPercentage-=5;
                                playAudio('./noises/foxy_knock.mp3');
                            }
                        }, foxyJumpscareStall);
                        foxyTimeoutSet = true;
                    } else {
                        foxyDeath = true;
                    }
                } else {
                    playAudio('./noises/foxy_knock.mp3');
                    foxyRunning = false;
                    foxyPos = 0;
                    powerPercentage -= 5;
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

        if ((Math.random() * 20 <= FREDDY_AI || freddyAttackMode) && !freddyDeath && powerPercentage > 0 && currentCam != freddyPos && !win) {
            setTimeout(() => {
                if (!freddyDeath) {
                    playAudio("./noises/freddy_laugh"+Math.ceil(Math.random()*3)+".mp3");
                }
            }, 10);
            
            if (!freddyAttackMode) {
                freddyAttackMode = true;
            }

            if (freddyPos == 10 && !rightDoorClosed) {
                freddyDeath = true;
                freddyPos = -1;
                setTimeout(() => {
                    playAudio("./noises/freddy_laugh" + Math.ceil(Math.random() * 3) + ".mp3");
                }, 10);
            } else {
                if (freddyPos == 0 && bonniePos != 0 && chicaPos != 0) {
                    freddyPos = 1;
                } else if (freddyPos == 1) {
                    freddyPos = 6;
                } else if (freddyPos == 6) {
                    freddyPos = 5;
                    playAudio('./noises/freddy_song.mp3', { repeat: 'freddy_song', volume: 0.05})
                } else if (freddyPos == 5) {
                    freddyPos = 9;
                    stopAudio('freddy_song')
                } else if (freddyPos == 9) {
                    freddyPos = 10;
                }
            }
        }
        randomFreddy();
    }, timer)
}

function setCameraBlackout() {
    cameraBlackout = true;

    setTimeout(() => {
        cameraBlackout = false;
    }, 2000);
}

function tryJumpscare() {
    setTimeout(() => {
        if (((chicaDeath || bonnieDeath || freddyDeath) && cameraUp || foxyDeath || freddyDarkDeath) && !win) {
            dead = true;
            cameraBlackout = false;
            setTimeout(() => {
                if (win) {
                    return;
                }
                if (cameraUp) {
                    toggleCamera();
                }
                let officeImage = '';

                if (!freddyDarkDeath) {
                    document.getElementById('left_door').classList.add('invisible');
                    document.getElementById('right_door').classList.add('invisible');
                    document.getElementById('left_buttons').classList.add('none');
                    document.getElementById('right_buttons').classList.add('none');
                }

                if (freddyDarkDeath) {
                    officeImage = './screens/jumpscares/dark_jump.webp';
                } else if (foxyDeath) {
                    officeImage = './screens/jumpscares/foxy_jump.webp';
                } else if (bonnieDeath && !chicaDeath) {
                    officeImage = './screens/jumpscares/bonnie_jump.webp';
                } else if (chicaDeath && !bonnieDeath) {
                    officeImage = './screens/jumpscares/chica_jump.webp';
                } else if (chicaDeath && bonnieDeath) {
                    officeImage = Math.floor(Math.random() * 10) % 2 == 0 ? './screens/jumpscares/bonnie_jump.webp' : './screens/jumpscares/chica_jump.webp';
                } else if (freddyDeath) {
                    officeImage = './screens/jumpscares/freddy_jump.webp';
                }

                document.getElementById('main').src = officeImage;
                setTimeout(() => {
                    if (schoolSafeMode) {  
                        playAudio("./noises/safe_jumpscare.mp3");
                    } else {
                        playAudio("./noises/jumpscare.mp3");
                    }
                }, 10)
                setTimeout(() => {
                    document.body.classList.add('none');
                    setTimeout(() => {
                        const a = document.createElement('a');
                        a.href = './custom.html';
                        a.click();
                    }, 5000)
                }, 800)
            }, Math.floor(Math.random() * 3000));
        }

        if (!dead && !win) {
            tryJumpscare();
        }
    }, 10);
}

let blackoutStarted = false;
let blackoutFreddySong = false;
let blackoutDarkness = false;
let nextPhaseAttempts = 0;
function handleBlackout() {
    blackoutStarted = true;

    setTimeout(() => {
        nextPhaseAttempts++;
        if (!blackoutFreddySong) {
            if (nextPhaseAttempts == 8 || Math.ceil(Math.random() * 100) < 20) {
                blackoutFreddySong = true;
                playAudio('./noises/freddy_song.mp3', {repeat: 'freddy_song'});
                nextPhaseAttempts = 0;
            }
        } else if (!blackoutDarkness) {
            if (nextPhaseAttempts == 12 || Math.ceil(Math.random() * 100) < 20) {
                blackoutDarkness = true;
                stopAudio('freddy_song');
                nextPhaseAttempts = 0;
            }
        } else {
            if (nextPhaseAttempts == 12 || Math.ceil(Math.random() * 100) < 20) {
                freddyDarkDeath = true;
            }
        }

        if (!win && !freddyDarkDeath) {
            handleBlackout();
        }
    },1000);
}

let playedBlackoutAudio = false;
let playedWinAudio = false;
function render() {
    setTimeout(() => {
        if (FREDDY_AI === null || BONNIE_AI === null || CHICA_AI === null || FOXY_AI === null) {
            const a = document.createElement('a');
            a.href = './custom.html';
            a.click();
        }

        if (powerPercentage <= 0) {
            if (leftDoorClosed) {
                toggleDoor('left');
            }
            if (rightDoorClosed) {
                toggleDoor('right');
            }
            if (cameraUp) {
                toggleCamera();
            }
            if (rightLightOn) {
                toggleLight('right');
            }
            if (leftLightOn) {
                toggleLight('left');
            }
            document.getElementsByClassName('flip_camera_draw')[0].classList.add('invisible');
            if (!playedBlackoutAudio) {
                setTimeout(() => {
                    playAudio('./noises/blackout.mp3', {duration: 12000})
                }, 1);
                playedBlackoutAudio = true;
            }
        } 

        if (!cameraUp && !dead) {
            document.getElementById('main').style.filter = "";
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
            if (powerPercentage <= 0) {
                if (document.getElementById('left_buttons')) {
                    document.getElementById('left_buttons').remove();
                }
                if (document.getElementById('right_buttons')) {
                    document.getElementById('right_buttons').remove();
                }

                if (!blackoutFreddySong && !blackoutDarkness) {
                    officeImage = './screens/office/office_dark.png';
                } else if (blackoutDarkness) {
                    officeImage = './screens/office/office_darkness.png';
                } else if (blackoutFreddySong) {
                    officeImage = Math.ceil(Math.random()*10) < 10 ? './screens/office/office_dark.png' : './screens/office/office_dark_freddy.png';
                }
            } else {
                document.getElementById('left_buttons').src = leftButtonImage;
                document.getElementById('right_buttons').src = rightButtonImage;
            }
            document.getElementById('main').src = officeImage;
        } else if (cameraUp) {
            let currentScreen = `./screens/${camPositions[currentCam]}/cam`;
            foxyStall = randomRange(500, 1000);

            if (camPositions[currentCam] == '1C') {
                currentScreen += `_foxy${foxyPos}`;
                gifPlaying = false;
            } else if (camPositions[currentCam] == '2A' && foxyPos == 3 && foxyRunning) {
                if (foxyJumpscareStall == 0) {
                    setTimeout(() => {
                        playAudio("./noises/schmoovin.mp3");
                    }, 10)
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

            if (cameraBlackout && (Math.random()*20) < 18) {
                document.getElementById('main').style.filter = "brightness(0%)";
            } else {
                document.getElementById('main').style.filter = "";
            }

            if (!gifPlaying) {
                currentScreen += ".png";

                document.getElementById('main').src = currentScreen;
            }
        }


        if (powerPercentage <= 0) {
            document.getElementById('power_percentage').innerText = "";
            document.getElementById('current_night').innerText = "";
            document.getElementById('current_time').innerText = "";
            if (!blackoutStarted) {
                handleBlackout();
            }
        } else {
            document.getElementById('power_percentage').innerText = Math.max(Math.floor(powerPercentage), 0) + "%";
            document.getElementById('current_night').innerText = "Night " + CURRENT_NIGHT;
            document.getElementById('current_time').innerText = currentTime + "AM";
        }

        if (!dead && !win) {
            if (foxyStall > 0) {
                foxyStall--;
            }
            if (powerPercentage > 0) {
                let powerDrain = passivePowerDrain;

                if (leftDoorClosed) {
                    powerDrain += 0.004;
                }
                if (rightDoorClosed) {
                    powerDrain += 0.004;
                }
                if (leftLightOn || rightLightOn) {
                    powerDrain += 0.002;
                }
                if (cameraUp) {
                    powerDrain += 0.003;
                }

                powerPercentage -= powerDrain;
            
            }
            if (timeCount > 9000) {
                if (currentTime == 12) {
                    currentTime = 1;
                    timeCount = 0;
                } else if (currentTime != 5) {
                    currentTime++;
                    timeCount = 0;
                } else {
                    win = true;
                }
            } else {
                timeCount++;
            }

            render();
        } else if (win) {
            stopAllAudios();
            if (!playedWinAudio) {
                playAudio('./noises/chimes.mp3', { duration: 20000 });
            }
            document.body.querySelectorAll('div').forEach((div) => {
                if (!div.classList.contains('win_text')) {
                    div.classList.add("fade_black")
                } else {
                    div.classList.add('fade_in');
                    div.classList.remove('none');

                    if (div.classList.contains("win_text_hour")) {
                        setTimeout(() => {
                            div.classList.remove('fade_in');
                            div.classList.add('fade_black');
                            setTimeout(() => {
                                div.textContent = "6";
                                div.classList.remove('fade_black');
                                div.classList.add('fade_in');
                                setTimeout(() => {
                                    const a = document.createElement('a');
                                    a.href = './custom.html';
                                    a.click();
                                }, 5000)
                            }, 3000)
                        }, 3000)
                    }
                }
            });
        } else {
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
