import { SeedConfig, SEED_REGISTRY } from "@dendronhq/common-all";
import { Avatar, Card, Layout, List, PageHeader } from "antd";
import _ from "lodash";
import seedStyles from "../styles/scss/seeds.module.scss";
import { DendronComponent } from "../types";
// import { AddToWorkspaceButton, GoToSiteButton } from "./Seeds";
import { GoToSiteButton } from "./Seeds";

const SeedBrowser: DendronComponent = (props) => {
  const { ide, workspace } = props;
  const { browser } = workspace;
  const seedDataToRender = _.values(SEED_REGISTRY).map((data) => {
    if (data) {
      let payload: SeedConfig & { seedInWorkspace: boolean } = {
        ...data,
        seedInWorkspace: false,
      };
      if (_.includes(ide.seedsInWorkspace, data?.id)) {
        payload = {
          ...payload,
          seedInWorkspace: true,
        };
      }
      return payload;
    }
    return undefined;
  });

  const { Meta } = Card;
  const { Content } = Layout;

  return (
    // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
    <>
      {/*
       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
      <Layout className={seedStyles.layout}>
        {/*
         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
        <Content style={{ padding: "0 50px" }}>
          {/*
           // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
          <div className={seedStyles.contentDiv}>
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <PageHeader
              className={seedStyles.siteHeader}
              title="Dendron Seed Registry"
              subTitle="Add Knowledge Bases to your Workspace"
            />
            {/*
             // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
            <div className={seedStyles.listDiv}>
              {/*
               // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
              <List
                grid={{
                  gutter: 24,
                  xs: 1,
                  sm: 2,
                  md: 3,
                  lg: 3,
                  xl: 4,
                  xxl: 4,
                }}
                dataSource={seedDataToRender}
                renderItem={(item) => (
                  // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                  <List.Item>
                    {/*
                     // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                    <Card
                      className={seedStyles.card}
                      hoverable
                      actions={[
                        // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                        <GoToSiteButton
                          key={item?.id}
                          url={item!.site ? item!.site.url : undefined}
                          inVscode={!browser}
                        />,
                        {
                          /*
                         // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */
                        },
                        // <AddToWorkspaceButton
                        //   seedId={item?.id!}
                        //   existsInWorkspace={
                        //     item ? item.seedInWorkspace : false
                        //   }
                        // />,
                      ]}
                    >
                      {/*
                       // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead. */}
                      <Meta
                        className={seedStyles.cardMeta}
                        avatar={
                          // @ts-expect-error TS2686 - 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
                          <Avatar
                            src={
                              item?.assets
                                ? item.assets.publisherLogo
                                : undefined
                            }
                          />
                        }
                        title={item!.name}
                        description={item!.description}
                      />
                    </Card>
                  </List.Item>
                )}
              />
            </div>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default SeedBrowser;
