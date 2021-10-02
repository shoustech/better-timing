import React, { Fragment, useState } from "react";
import {
  EuiInMemoryTable,
  EuiSpacer,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTitle,
  EuiButtonIcon,
  EuiTab,
  EuiTabs,
} from "@elastic/eui";
import { Chart, Axis, BarSeries, LineSeries, Settings } from "@elastic/charts";
import { RIGHT_ALIGNMENT } from "@elastic/eui/lib/services";
import {
  EUI_CHARTS_THEME_DARK,
  EUI_CHARTS_THEME_LIGHT,
} from "@elastic/eui/dist/eui_charts_theme";
import "./style.less";

function DriverResults({ drivers }) {
  const driversClassified = {};
  const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState({});

  drivers.forEach((driver) => {
    if (!driversClassified[driver.class]) {
      driversClassified[driver.class] = [driver];
    } else {
      driversClassified[driver.class].push(driver);
    }
  });

  const getFastestDriver = (slowBoi) => {
    return driversClassified[slowBoi.class].find(
      (driver) => driver.position === 1
    );
    // return slowBoi;
  };

  const getTableTitle = (title) => {
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
  };

  const DisplayDriverResults = ({ driver }) => {
    const [selectedView, setSelectedView] = useState("Runs");

    const coneData = [];
    const fastestDriver = getFastestDriver(driver);
    const data = driver.runs.map(({ time, cones }, index) => {
      coneData.push({ x: index, y: cones, g: "Cones hit 😢" });
      return { x: index, y: time, g: driver.driver };
    });
    fastestDriver.runs.forEach(({ time }, index) => {
      data.push({ x: index, y: time, g: fastestDriver.driver });
    });
    const driverChart = () => (
      <Fragment>
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
          />
          <Axis id="bottom-axis" position="bottom" showGridLines />
          <Axis
            id="left-axis"
            position="left"
            showGridLines
            tickFormat={(d) => Number(d).toFixed(2)}
          />
        </Chart>
      </Fragment>
    );
    const displayRunsGroups = () => (
      <Fragment>
        <EuiFlexGroup>
          {driver.runs
            .filter((run) => run.runGroup === 1)
            .map((run, index) => (
              <EuiFlexItem key={index}>
                <p>{`1: ${run.time}` + (run.cones ? `+ ${run.cones}` : "")}</p>
              </EuiFlexItem>
            ))}
        </EuiFlexGroup>
        <EuiFlexGroup>
          {driver.runs
            .filter((run) => run.runGroup === 2)
            .map((run, index) => (
              <EuiFlexItem key={index}>
                <p>{`2: ${run.time}` + (run.cones ? `+ ${run.cones}` : "")}</p>
              </EuiFlexItem>
            ))}
        </EuiFlexGroup>
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
  };

  const toggleDetails = (driver) => {
    const newItemIdToExpandedRowMap = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMap[driver.number]) {
      delete newItemIdToExpandedRowMap[driver.number];
    } else {
      newItemIdToExpandedRowMap[driver.number] = (
        <DisplayDriverResults driver={driver} />
      );
    }
    setItemIdToExpandedRowMap(newItemIdToExpandedRowMap);
  };

  const makeDriverTable = (runClass, drivers) => {
    const columns = [
      {
        field: "position",
        name: "Position",
        sortable: true,
      },
      {
        field: "number",
        name: "Number",
        sortable: true,
      },
      {
        field: "driver",
        name: "Driver",
        sortable: true,
      },
      {
        field: "car",
        name: "Car",
        render: (car) => `${car.color} ${car.model}`,
      },
      {
        field: "runs",
        name: "Cones killed",
        render: (runs) => {
          let conesKilled = 0;
          runs.forEach(({ cones }) => {
            conesKilled += cones;
          });
          return conesKilled;
        },
      },
      {
        field: "runs",
        name: "Fastest time",
        render: (runs) => {
          const timeArray = runs.map(({ time }) => time);
          return Math.min(...timeArray);
        },
      },
      {
        align: RIGHT_ALIGNMENT,
        width: "40px",
        isExpander: true,
        render: (item) => {
          return (
            <EuiButtonIcon
              onClick={() => toggleDetails(item)}
              aria-label={
                itemIdToExpandedRowMap[item.number] ? "Collapse" : "Expand"
              }
              iconType={
                itemIdToExpandedRowMap[item.number] ? "arrowUp" : "arrowDown"
              }
            />
          );
        },
      },
    ];
    const sorting = {
      sort: {
        field: "position",
        direction: "asc",
      },
    };
    const pagination = {
      initialPageSize: 10,
      pageSizeOptions: [10, 25, 50, 100],
    };

    return (
      <Fragment>
        <EuiSpacer />
        <EuiPanel>
          <EuiTitle>
            <h3>{getTableTitle(runClass)}</h3>
          </EuiTitle>
          <EuiInMemoryTable
            items={drivers}
            itemId="number"
            columns={columns}
            // search={search}
            pagination={pagination}
            sorting={sorting}
            isSelectable={true}
            // selection={selection}
            // loading={isLoading}
            itemIdToExpandedRowMap={itemIdToExpandedRowMap}
            isExpandable={true}
          />
        </EuiPanel>
      </Fragment>
    );
  };
  return (
    <Fragment>
      {Object.entries(driversClassified).map(([runClass, drivers]) =>
        makeDriverTable(runClass, drivers)
      )}
    </Fragment>
  );
}

export { DriverResults };
