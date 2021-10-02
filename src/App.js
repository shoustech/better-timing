import React, { Component } from "react";
import {
  EuiPage,
  EuiPageBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from "@elastic/eui";
import "@elastic/charts/dist/theme_light.css";
import "@elastic/eui/dist/eui_theme_light.css";
import { FlyoutContext, flyoutDefaultContext } from "./context";
import { request } from "./lib";
import { DriverResults } from "./components";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flyout: flyoutDefaultContext,
      drivers: [],
    };
  }

  componentDidMount = async () => {
    const drivers = await request.json({
      method: "GET",
      path: "/api/results",
    });
    this.setState({ drivers });
  };

  toggleFlyout = () => {
    this.setState({
      ...this.state,
      flyout: {
        ...this.state.flyout,
        isFlyoutVisible: !this.state.flyout.isFlyoutVisible,
      },
    });
  };

  render() {
    return (
      <FlyoutContext.Provider
        value={{
          ...this.state.flyout,
          toggleFlyout: this.toggleFlyout,
          setTradeGroup: this.setTradeGroup,
        }}
      >
        <EuiPage restrictWidth={1200}>
          <EuiPageBody component="div">
            <EuiPageHeader>
              <EuiPageHeaderSection>
                <EuiTitle size="l">
                  <h1>Better Timing</h1>
                </EuiTitle>
              </EuiPageHeaderSection>
            </EuiPageHeader>

            <EuiTitle>
              <h2>Drivers</h2>
            </EuiTitle>

            <DriverResults drivers={this.state.drivers} />
          </EuiPageBody>
        </EuiPage>
      </FlyoutContext.Provider>
    );
  }
}

export default App;
