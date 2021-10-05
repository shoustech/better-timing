import React, { Fragment, useState } from "react";
import {
  EuiSpacer,
  EuiFlexItem,
  EuiTab,
  EuiTabs,
  EuiFlexGrid,
  EuiSelectable,
  EuiText,
  EuiFlexGroup,
} from "@elastic/eui";
import {
  Chart,
  Axis,
  BarSeries,
  LineSeries,
  Settings,
  ScaleType,
} from "@elastic/charts";
import {
  EUI_CHARTS_THEME_DARK,
  EUI_CHARTS_THEME_LIGHT,
} from "@elastic/eui/dist/eui_charts_theme";
import "./style.less";
import { getClassName, getRunString } from "../lib";

const getFastestDriver = (slowBoi, driversClassified) => {
  return driversClassified[slowBoi.class].find(
    (driver) => driver.position === 1
  );
};

function TimerChart({ driver, driversClassified, drivers }) {
  const fastestDriver = getFastestDriver(driver, driversClassified);
  const [selectedView, setSelectedView] = useState("Runs");
  const [driversSelectedForCompare, setDriversSelectedForCompare] = useState([
    driver.id,
    fastestDriver.id,
  ]);
  const coneData = [];
  const data = [];
  driversSelectedForCompare.map((driverKey) => {
    const selectedDriver = drivers.find((driver) => driver.id === driverKey);
    const fastestRun = Math.min(
      ...selectedDriver.runs
        .map(({ adjustedTime }) => adjustedTime)
        .filter((time) => time)
    );
    selectedDriver.runs.map(({ adjustedTime, cones }, index) => {
      const x = index + 1;
      if (selectedDriver.id === driver.id) {
        coneData.push({ x, y: cones, g: "Cones hit 😢" });
      }
      const dataObject = { x, y: adjustedTime, g: selectedDriver.driver };
      if (fastestRun === adjustedTime) {
        dataObject.fastest = true;
      }
      data.push(dataObject);
    });
  });

  const getSelectableDriverList = () => {
    const list = [];
    Object.entries(driversClassified).forEach(([runClass, drivers]) => {
      list.push({ label: `Class: ${getClassName(runClass)}`, disabled: true });
      drivers.forEach((driver) => {
        const selectionItem = {
          label: `${driver.driver} ${driver.car.model}`,
          key: driver.id,
        };
        if (driversSelectedForCompare.includes(driver.id)) {
          selectionItem.checked = "on";
        }
        list.push(selectionItem);
      });
    });

    return list;
  };

  const leftDomain = {
    min: 65,
  };

  const changeSelectedDrivers = (options) => {
    setDriversSelectedForCompare(
      options.filter((option) => option.checked === "on").map(({ key }) => key)
    );
  };

  const driverChart = () => (
    <EuiFlexGroup>
      <EuiFlexItem grow={false}>
        <EuiSelectable
          style={{ width: 300 }}
          onChange={changeSelectedDrivers}
          options={getSelectableDriverList()}
        >
          {(list) => list}
        </EuiSelectable>
      </EuiFlexItem>
      <EuiFlexItem>
        <Chart size={{ height: 200, width: "100%" }}>
          <Settings
            theme={
              false ? EUI_CHARTS_THEME_DARK.theme : EUI_CHARTS_THEME_LIGHT.theme
            }
            showLegend={true}
            legendPosition="right"
            showLegendDisplayValue={false}
          />
          <BarSeries
            id="cones"
            name="Cones"
            data={coneData}
            xAccessor={"x"}
            yAccessors={["y"]}
            splitSeriesAccessors={["g"]}
            stackAccessors={["g"]}
            groupId="cones"
          />
          <LineSeries
            id="runs"
            name="0"
            data={data}
            xAccessor={"x"}
            yAccessors={["y"]}
            splitSeriesAccessors={["g"]}
            xScaleType={ScaleType.Linear}
            groupId="runs"
            yScaleType={ScaleType.Linear}
            fit="linear"
            pointStyleAccessor={(datum) => {
              console.log(datum);
              let style = {};
              if (!datum.datum) {
                return;
              }
              if (datum.datum.fastest) {
                style = {
                  shape: "diamond",
                  opacity: 0.9,
                  radius: 5,
                  fill: "#FFD700",
                  stroke: "#000000",
                  strokeWidth: ".3",
                };
              }
              return style;
            }}
          />
          <Axis id="bottom-axis" position="bottom" showGridLines />
          <Axis
            id="left-axis"
            position="left"
            title="Run times"
            showGridLines
            groupId="runs"
            domain={leftDomain}
            tickFormat={(d) => Number(d).toFixed(0)}
          />
          <Axis
            id="right"
            title="Cones hit"
            groupId="cones"
            position="right"
            tickFormat={(d) => Number(d).toFixed(0)}
          />
        </Chart>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
  const displayRunsGroups = () => (
    <Fragment>
      <EuiFlexGrid columns={4}>
        {driver.runs.map((run, index) => {
          let speedDifference = "";
          if (run.adjustedTime && index !== 0) {
            const lastRun = driver.runs[index - 1].adjustedTime;
            console.log(lastRun);
            if (lastRun) {
              const speedDifferenceNumber = (
                run.adjustedTime - driver.runs[index - 1].adjustedTime
              ).toFixed(3);

              const positive = Math.sign(speedDifferenceNumber) === 1;
              speedDifference = (
                <EuiText color={positive ? "danger" : "success"}>
                  <p>{`(${positive ? "+" : ""}${speedDifferenceNumber})`}</p>
                </EuiText>
              );
            }
          }
          return (
            <EuiFlexItem key={index}>
              <p>{`${index + 1}: ${getRunString(run)}`}</p>
              {speedDifference}
            </EuiFlexItem>
          );
        })}
      </EuiFlexGrid>
    </Fragment>
  );

  return (
    <div style={{ display: "block", width: "100%" }}>
      <EuiTabs style={{ marginBottom: "10px" }} display="condensed">
        {["Runs", "Chart"].map((tab, index) => (
          <EuiTab
            onClick={() => setSelectedView(tab)}
            isSelected={selectedView === tab}
            key={index}
          >
            {tab}
          </EuiTab>
        ))}
      </EuiTabs>
      <EuiSpacer />
      {selectedView === "Runs" && displayRunsGroups()}
      {selectedView === "Chart" && driverChart()}
    </div>
  );
}

export { TimerChart };
