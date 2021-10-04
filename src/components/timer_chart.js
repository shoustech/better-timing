import React, { Fragment, useState } from "react";
import {
  EuiSpacer,
  EuiFlexItem,
  EuiTab,
  EuiTabs,
  EuiFlexGrid,
  EuiSelectable,
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
import { getClassName } from "../lib";

const getFastestDriver = (slowBoi, driversClassified) => {
  return driversClassified[slowBoi.class].find(
    (driver) => driver.position === 1
  );
};

const getRunString = (run) => {
  let andString = "";
  if (run.dnf) {
    andString = "+ dnf";
  } else if (run.cones !== 0) {
    andString = `+ ${run.cones}`;
  }
  return `${run.time}${andString}`;
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
    selectedDriver.runs.map(({ time, cones }, index) => {
      if (selectedDriver.id === driver.id) {
        coneData.push({ x: index, y: cones, g: "Cones hit 😢" });
      }
      data.push({ x: index, y: time, g: selectedDriver.driver });
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
            id="status"
            name="Status"
            data={coneData}
            xAccessor={"x"}
            yAccessors={["y"]}
            splitSeriesAccessors={["g"]}
            stackAccessors={["g"]}
          />
          <LineSeries
            id="bars"
            name="0"
            data={data}
            xAccessor={"x"}
            yAccessors={["y"]}
            splitSeriesAccessors={["g"]}
            xScaleType={ScaleType.Linear}
            yScaleType={ScaleType.Linear}
          />
          <Axis id="bottom-axis" position="bottom" showGridLines />
          <Axis
            id="left-axis"
            position="left"
            showGridLines
            domain={leftDomain}
            tickFormat={(d) => Number(d).toFixed(2)}
          />
        </Chart>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
  const displayRunsGroups = () => (
    <Fragment>
      <EuiFlexGrid columns={4}>
        {driver.runs
          .filter((run) => run.runGroup === 1)
          .map((run, index) => (
            <EuiFlexItem key={index}>
              <p>{`${index}: ` + `${getRunString(run)}`}</p>
            </EuiFlexItem>
          ))}
      </EuiFlexGrid>
    </Fragment>
  );
  console.log(selectedView);
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
