import {
  Typography,
  Collapse,
  Switch,
  Space,
  InputNumber,
  Input,
  Spin,
  Tooltip,
  Button,
  Radio,
} from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useState } from "react";
import { GraphConfig, GraphConfigItem } from "../utils/graph";
import AntThemes from "../styles/theme-antd";
import { useCurrentTheme } from "../hooks";
import { postVSCodeMessage } from "../utils/vscode";
import {
  DMessageSource,
  GraphThemeEnum,
  GraphViewMessage,
  GraphViewMessageEnum,
} from "@dendronhq/common-all";
import { ideHooks, ideSlice } from "@dendronhq/common-frontend";

const { Panel } = Collapse;

type FilterProps = {
  // type: "note" | "schema";
  config: GraphConfig;
  updateConfigField: (key: string, value: string | number | boolean) => void;
  isGraphReady: boolean;
  customCSS?: string;
  type?: "note" | "schema";
};

const GraphFilterView = ({
  config,
  updateConfigField,
  isGraphReady,
  customCSS,
  type,
}: FilterProps) => {
  const [showView, setShowView] = useState(false);
  const { currentTheme } = useCurrentTheme();

  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
  if (!currentTheme) return <></>;
  const isVisible = showView && isGraphReady;

  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Space
      direction="vertical"
      style={{
        zIndex: 10,
        position: "absolute",
        top: AntThemes[currentTheme].graph.filterView.margin,
        left: AntThemes[currentTheme].graph.filterView.margin,
        borderRadius: AntThemes[currentTheme].graph.filterView.borderRadius,
        minWidth: AntThemes[currentTheme].graph.filterView.minWidth,
      }}
    >
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Tooltip
        title={`${isVisible ? "Hide" : "Show"} Graph Configuration`}
        placement="right"
      >
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Button
          type="primary"
          shape="circle"
          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
          icon={isVisible ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={() => setShowView((v) => !v)}
          style={{
            opacity: isGraphReady ? 1 : 0,
            transform: "0.2s opacity ease-in-out",
          }}
        />
      </Tooltip>
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Collapse
        style={{
          background: AntThemes[currentTheme].graph.filterView.background,
          display: isVisible ? "block" : "none",
        }}
      >
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Panel header="Vaults" key="vaults">
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <FilterViewSection
            section="vaults"
            config={config}
            updateConfigField={updateConfigField}
          />
        </Panel>
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Panel header="Connections" key="connections">
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <FilterViewSection
            section="connections"
            config={config}
            updateConfigField={updateConfigField}
          />
        </Panel>
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Panel header="Filter" key="filter">
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <FilterViewSection
            section="filter"
            config={config}
            updateConfigField={updateConfigField}
          />
        </Panel>
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Panel header="Options" key="options">
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <FilterViewSection
            section="options"
            config={config}
            updateConfigField={updateConfigField}
          />
        </Panel>
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Panel header="Information" key="information">
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <FilterViewSection
            section="information"
            config={config}
            updateConfigField={updateConfigField}
          />
        </Panel>
        {type === "note" && (
          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
          <Panel header="Graph Theme" key="graphTheme">
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <FilterViewSection
              section="graphTheme"
              config={config}
              updateConfigField={updateConfigField}
              customCSS={customCSS}
            />
          </Panel>
        )}
      </Collapse>
    </Space>
  );
};

const FilterViewStringInput = ({
  fieldKey,
  label,
  entry,
  updateConfigField,
  nodeCount,
}: {
  fieldKey: string;
  label: string;
  entry: GraphConfigItem<string>;
  updateConfigField: (key: string, value: string | number | boolean) => void;
  nodeCount: number;
}) => {
  const [updateTimeout, setUpdateTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // This timeout is designed to maximize filter responsiveness while minimizing hang times
  const handleChange = (newValue: string) => {
    const delay = nodeCount < 100 ? 0 : 400;

    if (updateTimeout) clearTimeout(updateTimeout);

    setUpdateTimeout(
      setTimeout(() => {
        updateConfigField(fieldKey, newValue);

        setUpdateTimeout(null);
      }, delay)
    );
  };

  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Space direction="vertical" style={{ margin: "0.5rem 0rem" }}>
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Typography>{label}</Typography>
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Input
        defaultValue={entry.value}
        // @ts-expect-error TS2339 - Property 'value' does not exist on type 'EventTarget & HTMLInputElement'.
        onChange={(newValue) => handleChange(newValue.target.value)}
        disabled={!entry.mutable}
        placeholder={entry.placeholder || ""}
        suffix={
          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
          <Spin
            size="small"
            style={{
              display: updateTimeout ? "inline-block" : "none",
            }}
          />
        }
        style={{
          maxWidth: 200,
        }}
      />
    </Space>
  );
};

//TODO: either make this more generic or split it into multiple components.
const FilterViewSection = ({
  section,
  config,
  updateConfigField,
  customCSS,
}: {
  section: string;
  config: GraphConfig;
  updateConfigField: (key: string, value: string | number | boolean) => void;
  customCSS?: string;
}) => {
  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Space direction="vertical" style={{ width: "100%" }}>
      {Object.entries(config)
        .filter(([key]) => key.includes(section))
        .map(([key, entry]) => {
          const keyArray = key.split(".");
          const label =
            entry?.label ||
            `${keyArray[keyArray.length - 1]
              .split("-")
              .map((k) => _.capitalize(k))
              .join(" ")}`;

          return (
            // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
            <Space
              direction="horizontal"
              style={{ justifyContent: "space-between", width: "100%" }}
              key={key}
            >
              {_.isString(entry.value) && entry.singleSelect && (
                // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                <>
                  {/*
                   // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                  <RadioButton
                    value={entry.value as GraphThemeEnum}
                    customCSS={customCSS}
                  />
                  {/*
                   // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                  <Button
                    type="primary"
                    size="small"
                    onClick={configureCustomStyling}
                    style={{
                      transform: "0.2s opacity ease-in-out",
                    }}
                  >
                    {customCSS ? "Modify custom css" : "Create Your Own"}
                  </Button>
                </>
              )}
              {_.isBoolean(entry?.value) && (
                // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                <>
                  {/*
                   // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                  <Typography>{label}</Typography>
                  {/*
                   // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                  <Switch
                    checked={entry?.value}
                    onChange={(newValue) => updateConfigField(key, newValue)}
                    disabled={!entry?.mutable}
                  />
                </>
              )}
              {entry.label === config["filter.depth"].label &&
                config["options.show-local-graph"]?.value && (
                  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                  <>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <Typography>{label}</Typography>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <InputNumber
                      min={1}
                      max={3}
                      disabled={!entry.mutable}
                      defaultValue={(entry.value as number) || 1}
                      onChange={(newValue) => {
                        updateConfigField(key, newValue!);
                        updateGraphDepth(newValue as number);
                      }}
                    />
                  </>
                )}
              {_.isNumber(entry?.value) &&
                entry.label !== config["filter.depth"].label && (
                  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                  <>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <Typography>{label}</Typography>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <InputNumber
                      value={entry?.value}
                      onChange={(newValue) => updateConfigField(key, newValue!)}
                      disabled={!entry?.mutable}
                    />
                  </>
                )}
              {_.isString(entry?.value) &&
                !_.isUndefined(entry) &&
                !_.isUndefined(key) &&
                !entry.singleSelect && (
                  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                  <>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <FilterViewStringInput
                      fieldKey={key}
                      label={label}
                      entry={entry as GraphConfigItem<string>}
                      updateConfigField={updateConfigField}
                      nodeCount={config["information.nodes"].value}
                    />
                  </>
                )}
            </Space>
          );
        })}
    </Space>
  );
};

const RadioButton = ({
  value,
  customCSS,
}: {
  value: GraphThemeEnum;
  customCSS?: string;
}) => {
  let singleSelectOptions = Object.keys(GraphThemeEnum).map(
    (k) => GraphThemeEnum[k as GraphThemeEnum]
  );
  if (!customCSS) {
    singleSelectOptions = singleSelectOptions.filter(
      (option) => option !== GraphThemeEnum.Custom
    );
  }
  const ideDispatch = ideHooks.useIDEAppDispatch();
  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Radio.Group
      onChange={(e) => {
        updateGraphTheme(e.target.value);
        ideDispatch(ideSlice.actions.setGraphTheme(e.target.value));
      }}
      value={value}
    >
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Space direction="vertical">
        {singleSelectOptions.map((option) => (
          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
          <Radio key={option} value={option}>
            {option}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );
};

/**
 * vscode message to update graphTheme selected by User.
 * When the graph panel is disposed, this value is written back to Metadata Service.
 * @param graphTheme
 */
const updateGraphTheme = (graphTheme: GraphThemeEnum) => {
  postVSCodeMessage({
    type: GraphViewMessageEnum.onGraphThemeChange,
    data: { graphTheme },
    source: DMessageSource.webClient,
  } as GraphViewMessage);
};

const configureCustomStyling = () => {
  postVSCodeMessage({
    type: GraphViewMessageEnum.configureCustomStyling,
    source: DMessageSource.webClient,
  } as GraphViewMessage);
};

/**
 * vscode message to update graphDepth selected by User.
 * When the graph panel is disposed, this value is written back to Metadata Service.
 * @param graphDepth
 */
const updateGraphDepth = (graphDepth: number) => {
  postVSCodeMessage({
    type: GraphViewMessageEnum.onGraphDepthChange,
    data: { graphDepth },
    source: DMessageSource.webClient,
  } as GraphViewMessage);
};

export default GraphFilterView;
