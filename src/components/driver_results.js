import React, { Fragment, useState } from "react";
import {
  EuiInMemoryTable,
  EuiSpacer,
  EuiPanel,
  EuiTitle,
  EuiButtonIcon,
} from "@elastic/eui";
import { RIGHT_ALIGNMENT } from "@elastic/eui/lib/services";
import "./style.less";
import { TimerChart } from "./";
import { getClassName } from "../lib";
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

  const toggleDetails = (driver) => {
    const newItemIdToExpandedRowMap = { ...itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMap[driver.number]) {
      delete newItemIdToExpandedRowMap[driver.number];
    } else {
      newItemIdToExpandedRowMap[driver.number] = (
        <TimerChart
          driver={driver}
          driversClassified={driversClassified}
          drivers={drivers}
        />
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
            <h3>{getClassName(runClass)}</h3>
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
