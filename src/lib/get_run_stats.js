function getRunStats(drivers) {
  const allRuns = [];
  if (drivers.length === 0) {
    return { fastestTime: 0, slowestTime: 200 };
  }
  drivers.forEach((driver) => {
    console.log("driver", driver);
    allRuns.push(...driver.runs);
  });
  const fastestTime = Math.min(
    ...allRuns.map(({ adjustedTime }) => adjustedTime).filter((time) => time)
  );
  const slowestTime = Math.max(
    ...allRuns.map(({ adjustedTime }) => adjustedTime).filter((time) => time)
  );
  return { fastestTime, slowestTime };
}

export { getRunStats };
