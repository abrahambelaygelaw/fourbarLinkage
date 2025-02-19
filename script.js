
 const roundOff = (num) => {
   return Math.round(num * 10) / 10;
 };
 const cosLawAngle = function (a, b, c) {
   if (a > 0 && b > 0) {
     let C = Math.acos((a * a + b * b - c * c) / (2 * a * b));
     return C;
   } else {
     return 0;
   }
 };

 const cosLawLength = function (a, b, C) {
   let c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
   return c;
 };

 const linearInterp = function (x0, x1, alpha) {
   return (1 - alpha) * x0 + alpha * x1;
 };
 const solveFourBar = function (g, f, a, b, alpha, flipped) {
   let l = cosLawLength(a, g, alpha);
   let beta1 = cosLawAngle(g, l, a);
   let beta2 = cosLawAngle(l, b, f);
   if (Math.sin(alpha) > 0) {
     if (flipped) {
       return Math.PI - beta1 + beta2;
     } else {
       return Math.PI - beta1 - beta2;
     }
   } else {
     if (flipped) {
       return Math.PI + beta1 + beta2;
     } else {
       return Math.PI + beta1 - beta2;
     }
   }
 };

 
 const limitsFourBar = function (g, f, a, b) {
   let limits = {};
   limits.L = g + f + a + b;
   limits.ValidityIndex = limits.L - 2 * Math.max(g, f, a, b);
   limits.valid = limits.ValidityIndex >= 0 && Math.min(g, f, a, b) >= 0;
   if (limits.ValidityIndex >= 0) {
     limits.ValidityRelation = "≥ 0";
   } else {
     limits.ValidityRelation = "< 0";
   }

   limits.GrashofIndex =
     limits.L - 2 * (Math.max(g, f, a, b) + Math.min(g, f, a, b));
   if (limits.GrashofIndex > 0) {
     limits.GrashofRelation = "> 0";
   } else if (limits.GrashofIndex == 0) {
     limits.GrashofRelation = "= 0";
   } else {
     limits.GrashofRelation = "< 0";
   }

   limits.T1 = g + f - a - b;
   limits.T2 = b + g - a - f;
   limits.T3 = b + f - a - g;
   let charVal = function (TVal) {
     if (TVal > 0) {
       return "+";
     } else if (TVal == 0) {
       return "0";
     } else {
       // TVal < 0
       return "-";
     }
   };
   let linkageKey =
     charVal(limits.T1) + charVal(limits.T2) + charVal(limits.T3);

   let limitAngles = [
     cosLawAngle(a, g, f + b),
     -cosLawAngle(a, g, f + b),
     cosLawAngle(a, g, f - b),
     2 * Math.PI - cosLawAngle(a, g, f - b),
     cosLawAngle(a, g, b - f),
     2 * Math.PI - cosLawAngle(a, g, b - f),
   ];

   let keyMap = {
     "+++": ["crank", "rocker", true, 0, 0, -1, -1],
     "0++": ["crank", "π-rocker", true, 0, 2, -1, -1],
     "-++": ["π-rocker", "π-rocker", false, 0, 2, 2, 3],
     "+0+": ["crank", "0-rocker", true, 0, 2, -1, -1],
     "00+": ["crank", "crank", true, 0, 2, -1, -1],
     "-0+": ["crank", "crank", true, 0, 2, -1, -1],
     "+-+": ["π-rocker", "0-rocker", false, 0, 2, 4, 5],
     "0-+": ["crank", "crank", true, 0, 2, -1, -1],
     "--+": ["crank", "crank", true, 0, 0, -1, -1],
     "++0": ["crank", "π-rocker", true, 1, 2, -1, -1],
     "0+0": ["crank", "π-rocker", true, 0, 1, -1, -1],
     "-+0": ["π-rocker", "π-rocker", true, 1, 1, 2, 3],
     "+00": ["crank", "crank", true, 0, 1, -1, -1],
     "000": ["crank", "crank", true, 0, 1, -1, -1],
     "-00": ["crank", "crank", true, 0, 1, -1, -1],
     "+-0": ["π-rocker", "crank", true, 1, 1, 4, 5],
     "0-0": ["crank", "crank", true, 0, 1, -1, -1],
     "--0": ["crank", "crank", true, 1, 2, -1, -1],
     "++-": ["0-rocker", "π-rocker", false, 0, 2, 1, 0],
     "0+-": ["0-rocker", "π-rocker", true, 1, 1, 1, 0],
     "-+-": ["rocker", "rocker", true, 0, 2, 2, 0],
     "+0-": ["0-rocker", "crank", true, 1, 1, 1, 0],
     "00-": ["0-rocker", "crank", true, 1, 1, 1, 0],
     "-0-": ["0-rocker", "0-rocker", true, 1, 1, 1, 0],
     "+--": ["rocker", "crank", true, 0, 2, 4, 0],
     "0--": ["0-rocker", "crank", true, 1, 1, 1, 0],
     "---": ["0-rocker", "0-rocker", false, 0, 2, 1, 0],
   };
   let data = keyMap[linkageKey];
   limits.inputType = data[0];
   limits.outputType = data[1];
   limits.canFlip = data[4] > 0;
   limits.limited = data[5] >= 0;
   limits.Grashof = data[2];
   limits.flipPhase = data[3];
   limits.flipPeriod = data[4];
   limits.alphaMin = data[5] >= 0 ? limitAngles[data[5]] : 0;
   limits.alphaMax = data[6] >= 0 ? limitAngles[data[6]] : 0;

   if (limits.Grashof) {
     limits.GrashofType = "Grashof";
     limits.GrashofInfo = "rotates fully";
   } else {
     limits.GrashofType = "non-Grashof";
     limits.GrashofInfo = "reciprocates";
   }

   return limits;
 };

class FourBarLinkage {
  constructor(l1, l2, l3, l4) {
    this.l1 = l1; // ground link
    this.l2 = l2; // input link
    this.l3 = l3; // coupler
    this.l4 = l4; // output link
    this.A = { x: 0, y: 0, fixed: true }; // ground-input
    this.B = { x: 0, y: 0 }; // ground-output
    this.C = { x: 0, y: 0 }; // output-coupler
    this.D = { x: 0, y: 0 }; // coupler-input
    this.P = { x: 0, y: 0 }; // point on the coupler
    this.alpha = 0;
    this.beta = 0;
    this.scale = 4;
    this.alphaMin = 0;
    this.alphaMax = 2 * Math.PI;
    this.alphaRange = 2 * Math.PI;
    this.alphaCent = 0;
    this.limited = false;
    this.inputType = "";
    this.outputType = "";
    this.Grashof = "";
  }

  calculate(t) {
    // Reset base points
    this.A.x = 0;
    this.A.y = 0;
    this.B.x = this.l1 * Math.cos(groundPosition);
    this.B.y = this.l1 * Math.sin(groundPosition);
    let beta;

    let limits = limitsFourBar(this.l1, this.l3, this.l2, this.l4);
    console.log(limits);
    if (!limits.valid || Math.max(this.l1, this.l2, this.l3, this.l4) > 100) {
      document.getElementById("invalid-linkage").style.display = "flex";
      return false;
    }
    document.getElementById("invalid-linkage").style.display = "none";
    document.getElementById("input-type").innerText = limits.inputType;
    document.getElementById("output-type").innerText = limits.outputType;
    document.getElementById("linkage-type").innerText = limits.Grashof ? "Grashof" : "Non-Grashof";
    document.getElementById("validity-index").innerText = roundOff(limits.ValidityIndex)
    document.getElementById("grashof-index").innerText = roundOff(limits.GrashofIndex)
    let alphaLimited, alphaMin, alphaMax, alphaCent;
    let phase, alpha;
    let flipped = false;

    // --- IMPORTANT ---
    // We want to start at a desired initial alpha and then evolve continuously.
    // We do this by computing (once) a persistent time offset (stored as this.alphaOffset)
    // so that the computed alpha becomes:
    //   effectiveT = t + this.alphaOffset
    // and then our formulas (which normally use t) use effectiveT.
    // (Make sure to reset this.alphaOffset when restarting the simulation.)

    if (limits.limited) {
      // LIMITED BRANCH (usually with a range constraint)
      let r, c;
      if (oscInput) {
        c = oscCenter / 100;
        r = (Math.min(c, 1 - c) * oscMagnitude) / 100;
      } else {
        c = 0.5;
        r = 0.5;
      }
      alphaLimited = true;
      alphaMin = linearInterp(limits.alphaMin, limits.alphaMax, c - r);
      alphaMax = linearInterp(limits.alphaMin, limits.alphaMax, c + r);
      alphaCent = linearInterp(limits.alphaMin, limits.alphaMax, c);
      let alphaRange = alphaMax - alphaMin;

      // Compute and store the time offset (only once) so that at t=0 we have alpha === initialAlpha.
      if (typeof initialAlpha === "number" && this.alphaOffset === undefined) {
        // Our formula is:
        //   phase = (t + offset) / Math.max(alphaRange, 0.3) - 0.1,
        //   then w = c + r * sin(phase * PI),
        //   and finally: alpha = linearInterp(limits.alphaMin, limits.alphaMax, w).
        // At t = 0, we need to find an offset so that:
        //   initialAlpha = linearInterp(limits.alphaMin, limits.alphaMax, c + r * sin(phase0 * PI))
        // Let targetW = (initialAlpha - limits.alphaMin)/(limits.alphaMax - limits.alphaMin)
        // and solve for phase0:
        let targetW =
          (initialAlpha - limits.alphaMin) /
          (limits.alphaMax - limits.alphaMin);
        let sineArg = (targetW - c) / r;
        sineArg = Math.max(-1, Math.min(1, sineArg)); // clamp to valid range
        let phase0 = (1 / Math.PI) * Math.asin(sineArg);
        // Since at t=0: phase0 = (offset) / Math.max(alphaRange, 0.3) - 0.1,
        // we set:
        this.alphaOffset = (phase0 + 0.1) * Math.max(alphaRange, 0.3);
      }
      // Use the effective time for a smooth evolution:
      let effectiveT = t + (this.alphaOffset || 0);
      phase = effectiveT / Math.max(alphaRange, 0.3) - 0.1;
      let w = c + r * Math.sin(phase * Math.PI);
      alpha = linearInterp(limits.alphaMin, limits.alphaMax, w);

      if (limits.canFlip) {
        if (oscInput) {
          if (limits.flipPeriod == 2) {
            if (oscMagnitude == 100) {
              if (oscCenter > 50) {
                flipped = Math.cos(((phase + 0.5) * Math.PI) / 2) < 0;
              } else if (oscCenter == 50) {
                flipped = Math.cos(phase * Math.PI) < 0;
              } else {
                // oscCenter < 50
                flipped = Math.cos(((phase - 0.5) * Math.PI) / 2) < 0;
              }
            }
          } else if (limits.flipPeriod == 1) {
            if (oscMagnitude == 100) {
              if (oscCenter > 50) {
                if (Math.cos((phase / 4 + 1 / 8) * 2 * Math.PI) < 0) {
                  flipped = w > 0.5;
                } else {
                  flipped = w < 0.5;
                }
              } else if (oscCenter == 50) {
                flipped =
                  Math.cos(
                    (phase / limits.flipPeriod + limits.flipPhase / 4) *
                      2 *
                      Math.PI
                  ) < 0;
              } else {
                // oscCenter < 50
                if (Math.cos((phase / 4 - 1 / 8) * 2 * Math.PI) < 0) {
                  flipped = w < 0.5;
                } else {
                  flipped = w > 0.5;
                }
              }
            } else {
              // oscMagnitude < 100
              if (c + r > 0.5 && c - r < 0.5) {
                flipped = w > 0.5;
              }
            }
          }
        } else {
          flipped =
            Math.cos(
              (phase / limits.flipPeriod + limits.flipPhase / 4) * 2 * Math.PI
            ) < 0;
        }
      }
    } else {
      // NON-LIMITED BRANCH (no range restrictions)
      if (oscInput) {
        // Oscillatory variant
        let c = oscCenter / 100;
        let r = (0.5 * oscMagnitude) / 100;
        let alphaRange = r * 4 * Math.PI;
        alphaLimited = true;
        alphaMin = (c - r) * 2 * Math.PI;
        alphaMax = (c + r) * 2 * Math.PI;
        alphaCent = c * 2 * Math.PI;

        if (
          typeof initialAlpha === "number" &&
          this.alphaOffset === undefined
        ) {
          // Our formula here is: alpha = w * 2 * PI, with w = c + r*sin(oscPhase * PI)
          // At t=0, we want alpha = initialAlpha.
          let targetW = initialAlpha / (2 * Math.PI);
          let sineArg = (targetW - c) / r;
          sineArg = Math.max(-1, Math.min(1, sineArg));
          let phase0 = (1 / Math.PI) * Math.asin(sineArg);
          this.alphaOffset = (phase0 + 0.1) * Math.max(alphaRange, 0.3);
        }
        let effectiveT = t + (this.alphaOffset || 0);
        let oscPhase =
          alphaRange > 0 ? effectiveT / Math.max(alphaRange, 0.3) - 0.1 : 0;
        let w = c + r * Math.sin(oscPhase * Math.PI);
        alpha = w * 2 * Math.PI;

        if (limits.canFlip) {
          phase = alpha / (2 * Math.PI);
          flipped =
            Math.sin(
              (phase / limits.flipPeriod + limits.flipPhase / 4) * 2 * Math.PI
            ) < 0;
        }
      } else {
        // Simple non-limited, non-oscillatory evolution.
        alphaLimited = false;
        if (
          typeof initialAlpha === "number" &&
          this.alphaOffset === undefined
        ) {
          // Normally: alpha = t + Math.PI/2, so for t=0 we need offset = initialAlpha - Math.PI/2.
          this.alphaOffset = initialAlpha - Math.PI / 2;
        }
        let effectiveT = t + (this.alphaOffset || 0);
        alpha = effectiveT + Math.PI / 2;
        if (limits.canFlip) {
          phase = alpha / (2 * Math.PI);
          flipped =
            Math.sin(
              (phase / limits.flipPeriod + limits.flipPhase / 4) * 2 * Math.PI
            ) < 0;
        }
      }
    }
    flipped = reverse ? !flipped : flipped;
    let beta1 = solveFourBar(
      this.l1,
      this.l3,
      this.l2,
      this.l4,
      alpha,
      flipped
    );
    let beta2 = solveFourBar(
      this.l1,
      this.l3,
      this.l2,
      this.l4,
      alpha,
      !flipped
    );

    if (setFlag) {
      if (
        Math.abs(Math.abs(beta1) - Math.abs(initialBeta)) <
        Math.abs(Math.abs(beta2) - Math.abs(initialBeta))
      ) {
        beta = beta1;
      } else {
        beta = beta2;
        document.getElementById("reverse-angle").checked =
          !document.getElementById("reverse-angle").checked;
      }
    } else {
      beta = beta1;
    }

    // Recalculate point positions using the computed alpha and beta
    this.A.x = 0;
    this.A.y = 0;
    this.B.x = this.A.x + this.l1 * Math.cos(groundPosition);
    this.B.y = this.A.y + this.l1 * Math.sin(groundPosition);
    this.C.y =
      this.B.y + Math.sin(-direction * beta + groundPosition) * this.l4;
    this.C.x =
      this.B.x + Math.cos(-direction * beta + groundPosition) * this.l4;
    this.D.x =
      this.A.x + Math.cos(-direction * alpha + groundPosition) * this.l2;
    this.D.y =
      this.A.y + Math.sin(-direction * alpha + groundPosition) * this.l2;

    let ptx = this.C.x - this.D.x;
    let pty = this.C.y - this.D.y;
    let pox = -pty;
    let poy = ptx;

    this.P.x =
      this.D.x + ptx * (0.5 + PPosition / 200) + (pox * -Poffset) / 100;
    this.P.y =
      this.D.y + pty * (0.5 + PPosition / 200) + (poy * -Poffset) / 100;

    this.alphaMin = -direction * alphaMin + groundPosition;
    this.alphaMax = -direction * alphaMax + groundPosition;
    this.alphaCent = -direction * alphaCent + groundPosition;
    this.alphaRange = this.alphaMax - this.alphaMin;
    this.limited = alphaLimited;
    if (!this.limited) {
      this.alphaMin = 0;
      this.alphaMax = 2 * Math.PI;
      this.alphaRange = 4 * Math.PI;
      this.alphaCent = 0;
    }
    return true;
  }
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let linkage;
let initialAlpha = Math.PI / 4;
let initialBeta = 0;
let setFlag = false;
let inputType = "range";
let showInput = document.getElementById("show-input").checked;
let traceInput = document.getElementById("trace-input").checked;
let traceOutput = document.getElementById("trace-output").checked;
let traceCoupler = document.getElementById("trace-coupler").checked;
let showLabels = document.getElementById("show-labels").checked;
let direction = document.getElementById("direction").value ? 1 : -1;
let groundPosition =
  (-document.getElementById("ground-angle").value * Math.PI) / 180;
let reverse = !document.getElementById("reverse-angle").value;
let t = 0;
let isPlaying = false;
let PPosition = document.getElementById("coupler-position").value;
let Poffset = document.getElementById("coupler-offset").value;
let oscInput = !document.getElementById("oscInput").value;
let oscCenter = document.getElementById("oscInput-center").value;
let oscMagnitude = document.getElementById("oscInput-range").value;
let speed = document.getElementById("speed").value;
let couplerTracePath = [];
let inputTracePath = [];
let outputTracePath = [];

function updateLinkage() {
  let l1, l2, l3, l4;
  if (inputType === "range") {
    l1 = parseFloat(document.getElementById("link1").value) || 0;
    l2 = parseFloat(document.getElementById("link2").value) || 0;
    l3 = parseFloat(document.getElementById("link3").value) || 0;
    l4 = parseFloat(document.getElementById("link4").value) || 0;
  } else {
    l1 = parseFloat(document.getElementById("link1number").value) || 0;
    l2 = parseFloat(document.getElementById("link2number").value) || 0;
    l3 = parseFloat(document.getElementById("link3number").value) || 0;
    l4 = parseFloat(document.getElementById("link4number").value) || 0;
  }

  linkage = new FourBarLinkage(l1, l2, l3, l4);

  groundPosition =
    (-document.getElementById("ground-angle").value * Math.PI) / 180;
  reverse = document.getElementById("reverse-angle").checked;
  direction = document.getElementById("direction").checked ? -1 : 1;
  PPosition = document.getElementById("coupler-position").value;
  Poffset = document.getElementById("coupler-offset").value;
  oscInput = document.getElementById("oscInput").checked;
  oscCenter = document.getElementById("oscInput-center").value;
  oscMagnitude = document.getElementById("oscInput-range").value;
  showInput = document.getElementById("show-input").checked;
  traceInput = document.getElementById("trace-input").checked;
  traceOutput = document.getElementById("trace-output").checked;
  traceCoupler = document.getElementById("trace-coupler").checked;
  showLabels = document.getElementById("show-labels").checked;
  speed = document.getElementById("speed").value;

  // document.getElementById("input-type").innerText = linkage.inputType;
  // document.getElementById("output-type").innerText = linkage.outputType;
  // document.getElementById("grashof").innerText = linkage.Grashof ? "Rotates fully (Grashof)" : "Limited (Non-Grashof)";
  // couplerTracePath = [];
  // inputTracePath = [];
  // outputTracePath = [];

  draw();
  // coordinate update
  document.getElementById("ax").value = roundOff(linkage.A.x);
  document.getElementById("ay").value = -roundOff(linkage.A.y);
  document.getElementById("bx").value = roundOff(linkage.B.x);
  document.getElementById("by").value = -roundOff(linkage.B.y);
  document.getElementById("cx").value = roundOff(linkage.C.x);
  document.getElementById("cy").value = -roundOff(linkage.C.y);
  document.getElementById("dx").value = roundOff(linkage.D.x);
  document.getElementById("dy").value = -roundOff(linkage.D.y);
  document.getElementById("px").value = roundOff(linkage.P.x);
  document.getElementById("py").value = -roundOff(linkage.P.y);

  // range input update
  document.getElementById("link1number").value = roundOff(linkage.l1);
  document.getElementById("link2number").value = roundOff(linkage.l2);
  document.getElementById("link3number").value = roundOff(linkage.l3);
  document.getElementById("link4number").value = roundOff(linkage.l4);

  // number input update
  document.getElementById("link1").value = roundOff(linkage.l1);
  document.getElementById("link2").value = roundOff(linkage.l2);
  document.getElementById("link3").value = roundOff(linkage.l3);
  document.getElementById("link4").value = roundOff(linkage.l4);
  // set the labels

  document.getElementById("link1-label").textContent = `Ground Link (${l1})`;
  document.getElementById("link2-label").textContent = `Input Link (${l2})`;
  document.getElementById("link3-label").textContent = `Coupler Link (${l3})`;
  document.getElementById("link4-label").textContent = `Output Link (${l4})`;
  document.getElementById(
    "offset-label"
  ).textContent = `P Offset - ${Poffset}% of CD`;
  document.getElementById(
    "position-label"
  ).textContent = `P Position - ${PPosition}% from CD midpoint towards C`;
}

function setCoordinates() {
  setFlag = true;
  const ax = parseFloat(document.getElementById("ax").value) || 0;
  const ay = parseFloat(document.getElementById("ay").value) || 0;
  const bx = parseFloat(document.getElementById("bx").value) || 0;
  const by = parseFloat(document.getElementById("by").value) || 0;
  const cx = parseFloat(document.getElementById("cx").value) || 0;
  const cy = parseFloat(document.getElementById("cy").value) || 0;
  const dx = parseFloat(document.getElementById("dx").value) || 0;
  const dy = parseFloat(document.getElementById("dy").value) || 0;
  const px = parseFloat(document.getElementById("px").value) || 0;
  const py = parseFloat(document.getElementById("py").value) || 0;
  // calculate the offset and position
  const cdMidPoint = { x: (cx + dx) / 2, y: (cy + dy) / 2 };
  const dirX = dx - cx;
  const dirY = dy - cy;
  const vecCPx = px - cx;
  const vecCPy = py - cy;
  const dot = dirX * vecCPx + dirY * vecCPy;
  const magnitudeSquarred = dirX ** 2 + dirY ** 2;
  const projection = dot / magnitudeSquarred;
  const projY = cy + projection * dirY;
  const projX = cx + projection * dirX;

  let offset =
    (Math.sqrt((projX - px) ** 2 + (projY - py) ** 2) /
      Math.sqrt((cx - dx) ** 2 + (cy - dy) ** 2)) *
    100;
  // calculate the angle from the line CD to the line P-projection
  let cdMidPointToP = {
    x: px - cdMidPoint.x,
    y: py - cdMidPoint.y,
  };
  let cdMidPointToProj = {
    x: projX - cdMidPoint.x,
    y: projY - cdMidPoint.y,
  };
  let angleMidPointToP = Math.atan2(cdMidPointToP.y, cdMidPointToP.x);
  let angleMidPointToProj = Math.atan2(cdMidPointToProj.y, cdMidPointToProj.x);
  let angle = (angleMidPointToP - angleMidPointToProj) % (2 * Math.PI);

  offset = angle > 0 ? offset : -offset;

  let position =
    (Math.sqrt((projX - cdMidPoint.x) ** 2 + (projY - cdMidPoint.y) ** 2) /
      Math.sqrt((cx - cdMidPoint.x) ** 2 + (cy - cdMidPoint.y) ** 2)) *
    100;
  // compare the distance between the projection and C to the distance between projection and D
  position =
    Math.sqrt((projX - cx) ** 2 + (projY - cy) ** 2) >
    Math.sqrt((projX - dx) ** 2 + (projY - dy) ** 2)
      ? -position
      : position;

  const l1 = roundOff(Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2));
  const l2 = roundOff(Math.sqrt((dx - ax) ** 2 + (dy - ay) ** 2));
  const l3 = roundOff(Math.sqrt((cx - dx) ** 2 + (cy - dy) ** 2));
  const l4 = roundOff(Math.sqrt((bx - cx) ** 2 + (by - cy) ** 2));

  document.getElementById("coupler-position").value = position;
  document.getElementById("coupler-offset").value = offset;
  PPosition = position;
  Poffset = offset;
  //set the link lengths
  document.getElementById("link1").value = l1;
  document.getElementById("link2").value = l2;
  document.getElementById("link3").value = l3;
  document.getElementById("link4").value = l4;
  document.getElementById("link1-label").textContent = `Ground Link (${l1})`;
  document.getElementById("link2-label").textContent = `Input Link (${l2})`;
  document.getElementById("link3-label").textContent = `Coupler Link (${l3})`;
  document.getElementById("link4-label").textContent = `Output Link (${l4})`;

  linkage = new FourBarLinkage(l1, l2, l3, l4);
  groundPosition = Math.atan2(-(by - ay), bx - ax) || 0;
  initialAlpha = Math.atan2(dy - ay, dx - ax) || 0;
  initialAlpha += groundPosition;
  initialBeta = Math.atan2(cy - by, cx - bx) || 0;
  initialBeta += Math.PI * 2;
  initialBeta %= 2 * Math.PI;
  initialBeta += groundPosition;
  document.getElementById("ground-angle").value =
    ((-groundPosition * 180) / Math.PI + 360) % 360;
  reverse = document.getElementById("reverse-angle").checked;
  direction = document.getElementById("direction").checked ? -1 : 1;
  clearTrace();
  setFlag = false;
  updateLinkage();
  t = 0;
  draw();
  document.getElementById("ax").value = roundOff(linkage.A.x);
  document.getElementById("ay").value = -roundOff(linkage.A.y);
  document.getElementById("bx").value = roundOff(linkage.B.x);
  document.getElementById("by").value = -roundOff(linkage.B.y);
  document.getElementById("cx").value = roundOff(linkage.C.x);
  document.getElementById("cy").value = -roundOff(linkage.C.y);
  document.getElementById("dx").value = roundOff(linkage.D.x);
  document.getElementById("dy").value = -roundOff(linkage.D.y);
  document.getElementById("px").value = roundOff(linkage.P.x);
  document.getElementById("py").value = -roundOff(linkage.P.y);
  // set the labels
  document.getElementById(
    "link1-label"
  ).textContent = `Ground Link (${linkage.l1})`;
  document.getElementById(
    "link2-label"
  ).textContent = `Input Link (${linkage.l2})`;
  document.getElementById(
    "link3-label"
  ).textContent = `Coupler Link (${linkage.l3})`;
  document.getElementById(
    "link4-label"
  ).textContent = `Output Link (${linkage.l4})`;
}

function draw() {
  if (!linkage.calculate(t)) {
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCoordinate();
  // Set origin to center of canvas

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (showLabels) {
    ctx.beginPath();
    ctx.font = "15px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("A", -20, -10);
    ctx.fillText(
      "B",
      linkage.l1 * Math.cos(groundPosition) * linkage.scale - 20,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale - 10
    );
    ctx.fillText(
      "C",
      linkage.C.x * linkage.scale - 20,
      linkage.C.y * linkage.scale - 10
    );
    ctx.fillText(
      "D",
      linkage.D.x * linkage.scale - 20,
      linkage.D.y * linkage.scale - 10
    );
    ctx.fillText(
      "P",
      linkage.P.x * linkage.scale - 20,
      linkage.P.y * linkage.scale - 10
    );

    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    // ground symbols

    ctx.beginPath();
    ctx.moveTo(-20, 15);
    ctx.lineTo(20, 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-20, 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(20, 15);
    ctx.stroke();

    for (let i = -19; i <= 19; i += 6) {
      ctx.beginPath();
      ctx.moveTo(i, 15);
      ctx.lineTo(i + 5, 25);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale - 20,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale + 15
    );
    ctx.lineTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale + 20,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale + 15
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale
    );
    ctx.lineTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale + 15,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale + 15
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale
    );
    ctx.lineTo(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale - 15,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale + 15
    );
    ctx.stroke();
    ctx.beginPath();
    for (let i = -19; i <= 19; i += 6) {
      ctx.beginPath();
      ctx.moveTo(
        linkage.l1 * Math.cos(groundPosition) * linkage.scale + i,
        linkage.l1 * Math.sin(groundPosition) * linkage.scale + 15
      );
      ctx.lineTo(
        i + 5 + linkage.l1 * Math.cos(groundPosition) * linkage.scale,
        25 + linkage.l1 * Math.sin(groundPosition) * linkage.scale
      );
      ctx.stroke();
    }
  }
  // Set line properties
  ctx.lineWidth = 3;

  // Draw ground link
  ctx.setLineDash([15,5])
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(
    linkage.l1 * Math.cos(groundPosition) * linkage.scale,
    linkage.l1 * Math.sin(groundPosition) * linkage.scale
  );
  ctx.strokeStyle = "#000";
  ctx.stroke();

  
  function drawMovingParts() {
  ctx.lineWidth = 3;

    // Store the current position of P for tracing
    function drawCouplerPath() {
      couplerTracePath.push({
        x: linkage.P.x * linkage.scale,
        y: linkage.P.y * linkage.scale,
      });

      // Draw the traced path
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 0, 255)"; // Light blue
      ctx.lineWidth = 3;

      if (couplerTracePath.length > 1) {
        ctx.moveTo(couplerTracePath[0].x, couplerTracePath[0].y);
        for (let i = 1; i < couplerTracePath.length; i++) {
          ctx.lineTo(couplerTracePath[i].x, couplerTracePath[i].y);
        }
      }
      ctx.stroke();
    }

    if (traceCoupler) {
      drawCouplerPath();
    } else {
      couplerTracePath = [];
    }
    function drawInputPath() {
      inputTracePath.push({
        x: linkage.D.x * linkage.scale,
        y: linkage.D.y * linkage.scale,
      });

      // Draw the traced path
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255, 0, 0)"; // Light blue
      ctx.lineWidth = 3;

      if (inputTracePath.length > 1) {
        ctx.moveTo(inputTracePath[0].x, inputTracePath[0].y);
        for (let i = 1; i < inputTracePath.length; i++) {
          ctx.lineTo(inputTracePath[i].x, inputTracePath[i].y);
        }
      }
      ctx.stroke();
    }
    if (traceInput) {
      drawInputPath();
    } else {
      inputTracePath = [];
    }
    function drawOutputPath() {
      outputTracePath.push({
        x: linkage.C.x * linkage.scale,
        y: linkage.C.y * linkage.scale,
      });

      // Draw the traced path
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 0)"; // Light blue
      ctx.lineWidth = 3;

      if (outputTracePath.length > 1) {
        ctx.moveTo(outputTracePath[0].x, outputTracePath[0].y);
        for (let i = 1; i < outputTracePath.length; i++) {
          ctx.lineTo(outputTracePath[i].x, outputTracePath[i].y);
        }
      }
      ctx.stroke();
    }
    if (traceOutput) {
      drawOutputPath();
    } else {
      outputTracePath = [];
    }
    if (showInput) {
      // input angle center
      console.log(
        linkage.alphaCent,
        linkage.alphaRange,
        linkage.alphaMin,
        linkage.alphaMax
      );
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, 0);
      ctx.lineTo(
        50 * Math.cos(linkage.alphaCent) * linkage.scale,
        50 * Math.sin(linkage.alphaCent) * linkage.scale
      );
      ctx.strokeStyle = "#000";
      ctx.stroke();

      // input angle range
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        50 *
          Math.cos(linkage.alphaCent - linkage.alphaRange / 2) *
          linkage.scale,
        50 *
          Math.sin(linkage.alphaCent - linkage.alphaRange / 2) *
          linkage.scale
      );
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        50 *
          Math.cos(linkage.alphaCent + linkage.alphaRange / 2) *
          linkage.scale,
        50 *
          Math.sin(linkage.alphaCent + linkage.alphaRange / 2) *
          linkage.scale
      );
      ctx.strokeStyle = "#000";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        0,
        0,
        50,
        direction == 1
          ? linkage.alphaCent + linkage.alphaRange / 2
          : linkage.alphaCent - linkage.alphaRange / 2,
        direction == 1
          ? linkage.alphaCent - linkage.alphaRange / 2
          : linkage.alphaCent + linkage.alphaRange / 2
      );
      ctx.strokeStyle = "#000";
      ctx.stroke();
    }

    ctx.setLineDash([]);
    // Draw input link
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(linkage.D.x * linkage.scale, linkage.D.y * linkage.scale);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Draw coupler
    ctx.beginPath();
    ctx.moveTo(linkage.D.x * linkage.scale, linkage.D.y * linkage.scale);
    ctx.lineTo(linkage.C.x * linkage.scale, linkage.C.y * linkage.scale);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Draw output link
    ctx.beginPath();
    ctx.moveTo(
      linkage.l1 * linkage.scale * Math.cos(groundPosition),
      linkage.l1 * linkage.scale * Math.sin(groundPosition)
    );
    ctx.lineTo(linkage.C.x * linkage.scale, linkage.C.y * linkage.scale);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Draw point P links to coupler
    ctx.beginPath();
    ctx.moveTo(linkage.C.x * linkage.scale, linkage.C.y * linkage.scale);
    ctx.lineTo(linkage.P.x * linkage.scale, linkage.P.y * linkage.scale);
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(linkage.P.x * linkage.scale, linkage.P.y * linkage.scale);
    ctx.lineTo(linkage.D.x * linkage.scale, linkage.D.y * linkage.scale);
    ctx.strokeStyle = "#000";
    ctx.stroke();

    // Draw joints as circles
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;

    // Ground joints
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      linkage.l1 * Math.cos(groundPosition) * linkage.scale,
      linkage.l1 * Math.sin(groundPosition) * linkage.scale,
      4,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.fill();

  

    ctx.fillStyle = "#000";
    ctx.lineWidth = 3;
    // Moving joints
    ctx.beginPath();
    ctx.arc(
      linkage.D.x * linkage.scale,
      linkage.D.y * linkage.scale,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      linkage.C.x * linkage.scale,
      linkage.C.y * linkage.scale,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  drawMovingParts();
  ctx.restore();
  let increment = speed / 200;
  if (isPlaying) {
    t += increment;
  }
}
function drawCoordinate() {
  ctx.strokeStyle = "#aaa";
  ctx.lineWidth = 2;
  // Draw X and Y axes
  ctx.beginPath();
  ctx.moveTo(0, 1000); // Y-axis start
  ctx.lineTo(2000, 1000); // Y-axis end
  ctx.moveTo(1000, 0); // X-axis start
  ctx.lineTo(1000, 2000); // X-axis end
  ctx.stroke();

  // Draw grid with 10-unit intervals
  ctx.fillStyle = "#999";

  ctx.font = "6px Arial bold";
  for (let i = -1000; i <= 1000; i += 20) {
    ctx.beginPath();
    ctx.arc(1000 + i * 2, 1000, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1000, 1000 - i * 2, 3, 0, Math.PI * 2);
    ctx.fill();
    // make lines for grid
    ctx.strokeStyle = "rgba(0, 0, 255, 0.1)";
    ctx.beginPath();
    1000;
    ctx.moveTo(1000 + i * 2, 0);
    ctx.lineTo(1000 + i * 2, 2000);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 1000 - i * 2);
    ctx.lineTo(2000, 1000 - i * 2);
    ctx.stroke();
  }
}

function reset() {
  // update the input values
  document.getElementById("direction").checked = false;
  document.getElementById("ground-angle").value = 0;
  document.getElementById("reverse-angle").checked = false;
  document.getElementById("oscInput").checked = false;
  document.getElementById("oscInput-center").value = 50;
  document.getElementById("oscInput-range").value = 50;
  document.getElementById("coupler-position").value = 0;
  document.getElementById("coupler-offset").value = 0;
  document.getElementById("speed").value = 5;
  isPlaying = false;
 document.getElementById("play").innerHTML = "Play";
 document.querySelectorAll(".coordinate").forEach((input) => {
   input.disabled = false;
   input.style.cursor = "pointer";
 });
 document.getElementById("setCoordinates").disabled = false;
 document.getElementById("setCoordinates").style.cursor = "pointer";
 document.getElementById("adjust-angle").disabled = false;
  t = 0;
  document.getElementById("show-input").checked = false;
  document.getElementById("trace-input").checked = false;
  document.getElementById("trace-output").checked = false;
  document.getElementById("trace-coupler").checked = false;
  document.getElementById("show-labels").checked = true;
  clearTrace();
  updateLinkage();
}

function animate() {
  draw();
  isPlaying && requestAnimationFrame(animate);
  document.getElementById("ax").value = roundOff(linkage.A.x);
  document.getElementById("ay").value = -roundOff(linkage.A.y);
  document.getElementById("bx").value = roundOff(linkage.B.x);
  document.getElementById("by").value = -roundOff(linkage.B.y);
  document.getElementById("cx").value = roundOff(linkage.C.x);
  document.getElementById("cy").value = -roundOff(linkage.C.y);
  document.getElementById("dx").value = roundOff(linkage.D.x);
  document.getElementById("dy").value = -roundOff(linkage.D.y);
  document.getElementById("px").value = roundOff(linkage.P.x);
  document.getElementById("py").value = -roundOff(linkage.P.y);
  // set the labels
  document.getElementById(
    "link1-label"
  ).textContent = `Ground Link (${linkage.l1})`;
  document.getElementById(
    "link2-label"
  ).textContent = `Input Link (${linkage.l2})`;
  document.getElementById(
    "link3-label"
  ).textContent = `Coupler Link (${linkage.l3})`;
  document.getElementById(
    "link4-label"
  ).textContent = `Output Link (${linkage.l4})`;
}

function clearTrace() {
  couplerTracePath = [];
  inputTracePath = [];
  outputTracePath = [];
}
 document.querySelectorAll(".tab").forEach((tab) => {
   tab.addEventListener("click", () => {
     document
       .querySelectorAll(".tab")
       .forEach((t) => t.classList.remove("active"));
     document
       .querySelectorAll(".tab-content")
       .forEach((c) => c.classList.remove("active"));
     tab.classList.add("active");
     document
       .getElementById(tab.getAttribute("data-tab"))
       .classList.add("active");
   });
 });

// play
document.getElementById("play").addEventListener("click", () => {
  if (!isPlaying) {
    isPlaying = true;
    document.getElementById("play").innerHTML = "Pause";
    animate();
    document.querySelectorAll(".coordinate").forEach((input) => {
      input.disabled = true;
      input.style.cursor = "not-allowed";
    });
    document.getElementById("setCoordinates").disabled = true;
    document.getElementById("setCoordinates").style.cursor = "not-allowed";
    document.getElementById("adjust-angle").disabled = true;
  } else {
    isPlaying = false;
    document.getElementById("play").innerHTML = "Play";
    document.querySelectorAll(".coordinate").forEach((input) => {
      input.disabled = false;
      input.style.cursor = "pointer";
    });
    document.getElementById("setCoordinates").disabled = false;
    document.getElementById("setCoordinates").style.cursor = "pointer";
    document.getElementById("adjust-angle").disabled = false;
  }
});

//speed
document.getElementById("speed").addEventListener("input", updateLinkage);

// show-hide input events
document.querySelectorAll(".checkbox").forEach((input) => {
  input.addEventListener("input", updateLinkage);
});

// input type event
document.querySelectorAll(".link").forEach((input) => {
  input.addEventListener("input", ()=>{
    inputType = "range";
    clearTrace();
    updateLinkage();
  });
});

document.querySelectorAll(".link-number").forEach((input) => {
  input.addEventListener("input", () => {
    clearTrace();
    inputType = "number";
    updateLinkage();
  });
});

// Orientation
document.querySelectorAll(".orientation").forEach((input) => {
  input.addEventListener("input", () => {
    clearTrace();
    updateLinkage();
  });
});
// set coordinates event
document
  .getElementById("setCoordinates")
  .addEventListener("click", setCoordinates);

document.getElementById("direction").addEventListener("click", updateLinkage);
document
  .getElementById("reverse-angle")
  .addEventListener("click", updateLinkage);

document.getElementById("oscInput").addEventListener("input", () => {
  document.getElementById("show-input").checked = true;
  updateLinkage();
});
document.getElementById("oscInput-center").addEventListener("input", () => {
  document.getElementById("show-input").checked = true;
  document.getElementById("oscInput").checked = true;
  updateLinkage();
});
document.getElementById("oscInput-range").addEventListener("input", () => {
  document.getElementById("show-input").checked = true;
  document.getElementById("oscInput").checked = true;
  updateLinkage();
});
// coupler position and offset
document
  .getElementById("coupler-position")
  .addEventListener("input", updateLinkage);
document
  .getElementById("coupler-offset")
  .addEventListener("input", updateLinkage);
// ground angle
document.getElementById("adjust-angle").addEventListener("input", () => {
  clearTrace();
  t = document.getElementById("adjust-angle").value * 0.01 * speed * direction;
  updateLinkage();
});

//reset button
document.getElementById("reset").addEventListener("click", reset);

// Initialize
updateLinkage();
animate();
