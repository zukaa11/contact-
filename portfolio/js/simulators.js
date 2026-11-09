// ============================================================================
// ZUKA OKROPIRIDZE - INTERACTIVE ROBOTICS FIRMWARE SIMULATORS
// 1. Autonomous Line Follower PID Simulation
// 2. Automated Parking Gate & RFID Access Simulation
// 3. Finite State Machine (FSM) Traffic Light Simulation
// 4. Smart Home Gas & Environmental Safety Simulator
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

  // --------------------------------------------------------------------------
  // 1. LINE FOLLOWER ROBOT SIMULATOR
  // --------------------------------------------------------------------------
  const lfCanvas = document.getElementById('line-follower-canvas');
  if (lfCanvas) {
    const ctx = lfCanvas.getContext('2d');
    let width = (lfCanvas.width = lfCanvas.clientWidth || 600);
    let height = (lfCanvas.height = 340);

    window.addEventListener('resize', () => {
      if (lfCanvas.clientWidth) {
        width = lfCanvas.width = lfCanvas.clientWidth;
        height = lfCanvas.height = 340;
      }
    });

    // Track path (Smooth Oval / Infinity loop track)
    function getTrackPoint(t) {
      // Parametric race track
      const cx = width / 2;
      const cy = height / 2;
      const rx = Math.min(width * 0.38, 220);
      const ry = Math.min(height * 0.36, 110);
      
      const x = cx + rx * Math.sin(t);
      const y = cy + ry * Math.sin(t * 2) * 0.5;
      return { x, y };
    }

    let t = 0;
    let isRunning = true;
    let robotSpeed = 0.008;
    let kp = 1.2;
    let kd = 0.6;
    let lastError = 0;

    const runBtn = document.getElementById('lf-run-btn');
    const speedInput = document.getElementById('lf-speed');
    const kpInput = document.getElementById('lf-kp');
    const errorDisplay = document.getElementById('lf-error');
    const pwmLeftBar = document.getElementById('lf-pwm-left');
    const pwmRightBar = document.getElementById('lf-pwm-right');

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        runBtn.innerHTML = isRunning 
          ? '<i class="fas fa-pause mr-1"></i> PAUSE' 
          : '<i class="fas fa-play mr-1"></i> RUN SIMULATION';
        if (typeof playCyberSound === 'function') playCyberSound('beep');
      });
    }

    if (speedInput) {
      speedInput.addEventListener('input', (e) => {
        robotSpeed = parseFloat(e.target.value) * 0.004;
      });
    }

    if (kpInput) {
      kpInput.addEventListener('input', (e) => {
        kp = parseFloat(e.target.value);
      });
    }

    function renderLineFollower() {
      ctx.clearRect(0, 0, width, height);

      // Draw Grid / Arena Background
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Course Track (Dark Tape Line)
      ctx.beginPath();
      for (let step = 0; step <= Math.PI * 2; step += 0.02) {
        const pt = getTrackPoint(step);
        if (step === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 14;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#050c18';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Current Robot State
      if (isRunning) {
        t += robotSpeed;
        if (t > Math.PI * 2) t -= Math.PI * 2;
      }

      const currentPos = getTrackPoint(t);
      const nextPos = getTrackPoint(t + 0.03);
      const heading = Math.atan2(nextPos.y - currentPos.y, nextPos.x - currentPos.x);

      // Simulated IR sensor array reading
      const simulatedNoise = (Math.sin(t * 30) * 0.4);
      const error = simulatedNoise;
      const derivative = error - lastError;
      const pidCorrection = (kp * error) + (kd * derivative);
      lastError = error;

      const basePWM = 200;
      const leftPWM = Math.max(0, Math.min(255, Math.round(basePWM + pidCorrection * 40)));
      const rightPWM = Math.max(0, Math.min(255, Math.round(basePWM - pidCorrection * 40)));

      if (errorDisplay) errorDisplay.textContent = (error >= 0 ? '+' : '') + error.toFixed(2);
      if (pwmLeftBar) pwmLeftBar.style.width = `${(leftPWM / 255) * 100}%`;
      if (pwmRightBar) pwmRightBar.style.width = `${(rightPWM / 255) * 100}%`;

      // Render Robot Body
      ctx.save();
      ctx.translate(currentPos.x, currentPos.y);
      ctx.rotate(heading);

      // Chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-22, -15, 44, 30, 4);
      ctx.fill();
      ctx.stroke();

      // Dual Drive Wheels
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(-12, -19, 14, 4);
      ctx.fillRect(-12, 15, 14, 4);

      // 8x IR Phototransistor Sensor Array at Front
      const sensorX = 20;
      for (let i = -3.5; i <= 3.5; i += 1) {
        const sy = i * 3.5;
        ctx.beginPath();
        ctx.arc(sensorX, sy, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = Math.abs(sy - error * 8) < 4 ? '#00ff9d' : '#ff0055';
        ctx.fill();
      }

      // Microcontroller chip representation
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#9d4edd';
      ctx.lineWidth = 1;
      ctx.fillRect(-8, -7, 16, 14);
      ctx.stroke();

      ctx.restore();

      requestAnimationFrame(renderLineFollower);
    }
    renderLineFollower();
  }

  // --------------------------------------------------------------------------
  // 2. AUTOMATED PARKING GATE & RFID ACCESS SIMULATOR
  // --------------------------------------------------------------------------
  const triggerGateBtn = document.getElementById('gate-trigger-btn');
  const gateBoom = document.getElementById('gate-boom');
  const gateStatus = document.getElementById('gate-status');
  const gateLed = document.getElementById('gate-led');
  const parkingCounter = document.getElementById('parking-counter');
  let availableSlots = 14;
  let isGateBusy = false;

  if (triggerGateBtn && gateBoom) {
    triggerGateBtn.addEventListener('click', () => {
      if (isGateBusy) return;
      isGateBusy = true;
      if (typeof playCyberSound === 'function') playCyberSound('access');

      // Step 1: RFID Scan Handshake
      gateStatus.textContent = 'SCANNING RFID: UID [0x8F, 0x4A, 0x22, 0x91]';
      gateStatus.className = 'text-yellow-400 font-mono text-xs';

      setTimeout(() => {
        // Step 2: Access Granted & Servo Lift
        if (typeof playCyberSound === 'function') playCyberSound('beep');
        gateStatus.textContent = 'ACCESS GRANTED // SERVO LIFTING 90°';
        gateStatus.className = 'text-emerald-400 font-mono text-xs';
        gateLed.className = 'w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#00ff9d] inline-block';
        gateBoom.style.transform = 'rotate(-85deg)';

        if (availableSlots > 0) {
          availableSlots--;
          if (parkingCounter) parkingCounter.textContent = availableSlots;
        }

        setTimeout(() => {
          // Step 3: Vehicle Ingress & Barrier Lower
          gateStatus.textContent = 'VEHICLE CLEARED // LOWERING BARRIER';
          gateStatus.className = 'text-cyan-400 font-mono text-xs';
          gateBoom.style.transform = 'rotate(0deg)';
          gateLed.className = 'w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ff0055] inline-block';

          setTimeout(() => {
            gateStatus.textContent = 'IDLE // READY FOR NEXT VEHICLE';
            gateStatus.className = 'text-slate-400 font-mono text-xs';
            isGateBusy = false;
          }, 1500);

        }, 3200);

      }, 1000);
    });
  }

  // --------------------------------------------------------------------------
  // 3. SYNCHRONIZED TRAFFIC LIGHT FSM SIMULATOR
  // --------------------------------------------------------------------------
  const tfNsGreen = document.getElementById('tf-ns-green');
  const tfNsYellow = document.getElementById('tf-ns-yellow');
  const tfNsRed = document.getElementById('tf-ns-red');
  const tfPedWalk = document.getElementById('tf-ped-walk');
  const tfPedDont = document.getElementById('tf-ped-dont');
  const tfStateLabel = document.getElementById('tf-state-label');
  const tfInterruptBtn = document.getElementById('tf-interrupt-btn');

  let tfState = 'NS_GREEN'; // NS_GREEN, NS_YELLOW, ALL_RED, PED_WALK
  let tfTimer = null;

  function setLights(nsG, nsY, nsR, pWalk, pDont, stateName) {
    if (!tfNsGreen) return;
    tfNsGreen.style.opacity = nsG ? '1' : '0.15';
    tfNsYellow.style.opacity = nsY ? '1' : '0.15';
    tfNsRed.style.opacity = nsR ? '1' : '0.15';
    tfPedWalk.style.opacity = pWalk ? '1' : '0.15';
    tfPedDont.style.opacity = pDont ? '1' : '0.15';
    if (tfStateLabel) tfStateLabel.textContent = stateName;
  }

  function runTrafficFSM() {
    clearTimeout(tfTimer);

    if (tfState === 'NS_GREEN') {
      setLights(true, false, false, false, true, 'STATE: NORTH_SOUTH_GREEN');
      tfTimer = setTimeout(() => {
        tfState = 'NS_YELLOW';
        runTrafficFSM();
      }, 5000);
    } else if (tfState === 'NS_YELLOW') {
      setLights(false, true, false, false, true, 'STATE: NORTH_SOUTH_YELLOW (CLEARANCE)');
      tfTimer = setTimeout(() => {
        tfState = 'ALL_RED';
        runTrafficFSM();
      }, 2000);
    } else if (tfState === 'ALL_RED') {
      setLights(false, false, true, false, true, 'STATE: ALL_RED_SAFETY_INTERLOCK');
      tfTimer = setTimeout(() => {
        tfState = 'PED_WALK';
        runTrafficFSM();
      }, 1200);
    } else if (tfState === 'PED_WALK') {
      setLights(false, false, true, true, false, 'STATE: PEDESTRIAN_WALK_PRIORITY');
      tfTimer = setTimeout(() => {
        tfState = 'NS_GREEN';
        runTrafficFSM();
      }, 4000);
    }
  }

  if (tfInterruptBtn) {
    runTrafficFSM();
    tfInterruptBtn.addEventListener('click', () => {
      if (typeof playCyberSound === 'function') playCyberSound('access');
      if (tfState === 'NS_GREEN') {
        clearTimeout(tfTimer);
        tfState = 'NS_YELLOW';
        runTrafficFSM();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. SMART HOME SAFETY & SENSOR SIMULATOR
  // --------------------------------------------------------------------------
  const gasSlider = document.getElementById('sh-gas-slider');
  const tempSlider = document.getElementById('sh-temp-slider');
  const gasVal = document.getElementById('sh-gas-val');
  const tempVal = document.getElementById('sh-temp-val');
  const fanRelay = document.getElementById('sh-fan-relay');
  const valveRelay = document.getElementById('sh-valve-relay');
  const alarmHud = document.getElementById('sh-alarm-hud');

  function updateHomeTelemetry() {
    if (!gasSlider) return;
    const gas = parseInt(gasSlider.value);
    const temp = parseInt(tempSlider.value);

    if (gasVal) gasVal.textContent = gas + ' PPM';
    if (tempVal) tempVal.textContent = temp + ' °C';

    if (gas > 400) {
      // Emergency cut-off triggered
      if (fanRelay) {
        fanRelay.textContent = 'RELAY ON [ACTIVE EXHAUST]';
        fanRelay.className = 'text-red-400 font-bold';
      }
      if (valveRelay) {
        valveRelay.textContent = 'SOLENOID OFF [GAS CUT-OFF]';
        valveRelay.className = 'text-yellow-400 font-bold';
      }
      if (alarmHud) {
        alarmHud.textContent = 'HAZARD ALERT: FLAMMABLE GAS CONCENTRATION EXCEEDED!';
        alarmHud.className = 'text-red-400 font-bold animate-pulse text-xs';
      }
    } else {
      if (fanRelay) {
        fanRelay.textContent = 'RELAY OFF [STANDBY]';
        fanRelay.className = 'text-emerald-400';
      }
      if (valveRelay) {
        valveRelay.textContent = 'SOLENOID OPEN [SUPPLY ON]';
        valveRelay.className = 'text-cyan-400';
      }
      if (alarmHud) {
        alarmHud.textContent = 'STATUS: ALL SENSORS NOMINAL';
        alarmHud.className = 'text-emerald-400 text-xs';
      }
    }
  }

  if (gasSlider && tempSlider) {
    gasSlider.addEventListener('input', updateHomeTelemetry);
    tempSlider.addEventListener('input', updateHomeTelemetry);
    updateHomeTelemetry();
  }

});

