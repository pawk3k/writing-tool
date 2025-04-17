import { useEffect, useState } from "react";
import "antd/dist/antd.css";
import {
  Layout,
  Input,
  Card,
  Typography,
  Space,
  Divider,
  Anchor,
  Spin,
} from "antd";
import { DendronComponent, DendronProps } from "../types";
import { useWorkspaceProps } from "../hooks";
import { engineHooks } from "@dendronhq/common-frontend";
import {
  ConfigureUIMessage,
  ConfigureUIMessageEnum,
  ConfigUtils,
  DMessageSource,
} from "@dendronhq/common-all";
import { postVSCodeMessage } from "../utils/vscode";
import ConfigureElement from "./ConfigureElements";
import _, { debounce } from "lodash";
import { dendronConfig, getSortedConfig } from "../utils/dendronConfig";

const DendronConfigure: DendronComponent = ({ engine }: DendronProps) => {
  const [config, setConfig] = useState(engine.config);
  const [searchString, setSearchString] = useState("");
  const [workspace] = useWorkspaceProps();
  const { useConfig } = engineHooks;
  const configGroupMap = new Map<string, string>();
  const configSubMenuMap = new Map<string, string>();

  useEffect(() => {
    setConfig(engine.config);
    Object.keys(dendronConfig).forEach((key) => {
      dendronConfig[key].default = _.get(engine.config, key);
    });
  }, [engine.config]);

  useConfig({ opts: workspace });
  const { Header, Content, Sider } = Layout;
  const items = getSortedConfig().map((conf) => {
    return {
      key: conf,
      label: _.startCase(dendronConfig[conf].group),
    };
  });
  const menuItems = items.filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.label === value.label)
  );

  const cleanTitle = (title: string) => {
    return title
      .split(".")
      .map((k) => _.startCase(k))
      .join(" > ");
  };

  const postMessage = ({ key, value }: { key: string; value: any }) => {
    let newConf = _.cloneDeep(config);
    newConf = newConf && _.set(newConf, key, value);
    dendronConfig[key].default = value;
    setConfig(newConf);
    postVSCodeMessage({
      type: ConfigureUIMessageEnum.onUpdateConfig,
      data: { config: newConf },
      source: DMessageSource.webClient,
    } as ConfigureUIMessage);
  };

  const handleSearch = debounce((e: any) => {
    setSearchString(e.target.value);
  }, 500);

  const subMenuCardList = (submenu: string) => {
    return getSortedConfig()
      .filter((config) => _.lowerCase(config).includes(_.lowerCase(submenu)))
      .map((conf) => {
        return (
          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
          <Card
            key={conf}
            title={cleanTitle(conf.substring(conf.lastIndexOf(".") + 1))}
            id={conf}
          >
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <Typography.Paragraph>
              {dendronConfig[conf]?.type !== "boolean"
                ? ConfigUtils.getConfigDescription(conf)
                : null}
            </Typography.Paragraph>
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <ConfigureElement
              {...dendronConfig[conf]}
              name={conf}
              postMessage={postMessage}
            />
          </Card>
        );
      });
  };

  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {!config ? (
        // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
        <Spin />
      ) : (
        // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
        <>
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <Header className="header">
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <Input placeholder="search config" onChange={handleSearch} />
          </Header>
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <Layout>
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <Sider
              width={160}
              style={{
                height: "100%",
                borderRight: "1px solid #383838",
                margin: 0,
                padding: "20px 16px 0 21px",
              }}
            >
              {/*
               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
              <Anchor
                getContainer={() =>
                  // @ts-expect-error TS2584 - Cannot find name 'document'. Do you need to change your target library? Try changing the 'lib' compiler option to include 'dom'.
                  document.getElementById("configure-content")!
                }
              >
                {/*
                 // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ display: "flex" }}
                >
                  {menuItems.map((item) => (
                    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                    <Anchor.Link
                      key={item.key}
                      href={`#${item.label.toLowerCase()}`}
                      title={item.label}
                    />
                  ))}
                </Space>
              </Anchor>
            </Sider>
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <Layout>
              {/*
               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
              <Content
                id="configure-content"
                style={{
                  padding: 24,
                  margin: 0,
                  minHeight: 280,
                  height: "100%",
                  overflowY: "scroll",
                }}
              >
                {/*
                 // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ display: "flex" }}
                >
                  {getSortedConfig()
                    .filter((conf) =>
                      _.lowerCase(conf).includes(_.lowerCase(searchString))
                    )
                    .map((conf) => {
                      const submenu = conf.substring(0, conf.lastIndexOf("."));
                      return (
                        // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                        <>
                          {!configGroupMap.has(dendronConfig[conf]?.group) &&
                          configGroupMap.set(dendronConfig[conf]?.group, "") ? (
                            // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                            <Divider orientation="left">
                              {/*
                               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                              <Typography.Title
                                level={2}
                                id={dendronConfig[conf]?.group}
                              >
                                {_.startCase(dendronConfig[conf]?.group)}
                              </Typography.Title>
                            </Divider>
                          ) : null}
                          {conf.split(".").length > 2 ? (
                            !configSubMenuMap.has(submenu) &&
                            configSubMenuMap.set(submenu, "") && (
                              // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                              <Card title={cleanTitle(submenu)} id={submenu}>
                                {/*
                                 // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                                <Space
                                  direction="vertical"
                                  size="middle"
                                  style={{ display: "flex" }}
                                >
                                  {subMenuCardList(submenu)}
                                </Space>
                              </Card>
                            )
                          ) : (
                            // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                            <Card title={cleanTitle(conf)} id={conf}>
                              {/*
                               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                              <Typography.Paragraph>
                                {dendronConfig[conf]?.type !== "boolean"
                                  ? ConfigUtils.getConfigDescription(conf)
                                  : null}
                              </Typography.Paragraph>
                              {/*
                               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                              <ConfigureElement
                                {...dendronConfig[conf]}
                                name={conf}
                                postMessage={postMessage}
                              />
                            </Card>
                          )}
                        </>
                      );
                    })}
                </Space>
              </Content>
            </Layout>
          </Layout>
        </>
      )}
    </Layout>
  );
};

export default DendronConfigure;
