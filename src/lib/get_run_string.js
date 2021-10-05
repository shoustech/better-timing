export function getRunString(run) {
  let andString = "";
  if (run.dnf) {
    andString = "+dnf";
  } else if (run.cones !== 0) {
    andString = `+${run.cones}`;
  }
  return `${run.rawTime}${andString}`;
}
