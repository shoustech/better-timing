export function getClassName(title) {
  switch (title) {
    case "es":
      return "Experienced Street";
    case "er":
      return "Experienced Race";
    case "int":
      return "Intermediate";
    case "n":
      return "Novice";
    case "pony":
      return "Pony Car";
    case "fwd":
      return "Wrong-Wheel Drive";
    case "cst":
      return "Corvette Street";
    case "crt":
      return "Corvette Race";
    case "mzst":
      return "Zoom Zoom";
    default:
      return title;
  }
}
