import { ENGINE_HOOKS } from "../../presets";
import { runEngineTestV5 } from "../../engine";
import { GDocImportPod, PodUtils, PROMPT } from "@dendronhq/pods-core";
import { Time, VaultUtils } from "@dendronhq/common-all";
import { response, comments, existingNote } from "../../utils/GDocMockResult";
import axios from "axios";
import sinon from "sinon";
import { window } from "../../__mocks__/vscode";

vi.mock("axios");

const stubWindow = (resp: any) => {
  sinon.stub(window, "showInformationMessage").resolves(resp);
};

describe("GDoc import pod", () => {
  let result: any;
  const text = "\n\n## Testing GDoc Pod\n\nThis is the first line\n\n\n";
  const onPrompt = async (type?: PROMPT) => {
    const resp =
      type === PROMPT.USERPROMPT
        ? await window.showInformationMessage(
            "Do you want to overwrite",
            { modal: true },
            { title: "Yes" }
          )
        : window.showInformationMessage(
            "Note is already in sync with the google doc"
          );
    return resp;
  };
  const docIdsHashMap = { foo: "1dejjityws", bar: "skdeugndk" };
  const utilityMethods = {
    showInputBox: vi.fn().mockResolvedValue("gdoc.meet"),
    getGlobalState: vi.fn().mockResolvedValue(undefined),
    updateGlobalState: vi.fn().mockResolvedValue(undefined),
    openFileInEditor: vi.fn().mockResolvedValue(undefined),
    showDocumentQuickPick: vi.fn().mockResolvedValue({ label: "foo" }),
  };

  afterEach(() => {
    sinon.restore();
  });
  test("Import GDoc as Markdown", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxiosGet = vi.mocked(axios.get);
        PodUtils.downloadImage = vi.fn().mockReturnValue(`${text}`);
        result = response;
        mockedAxiosGet.mockResolvedValue(result);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "dhdjdjs",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
          },
        });
        expect(importedNotes[0].body).toMatch(text);
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("Import Comments in Markdown as json", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const response = {
          fname: "gdoc.meet",
          custom: {
            documentId: "sjkakauwu",
            revisionId: "ALm37BXFqAKco_",
          },
          body: text,
        };
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        pod.getDataFromGDoc = vi.fn().mockReturnValue(response);
        PodUtils.downloadImage = vi.fn();
        const mockedAxiosGet = vi.mocked(axios.get);
        result = comments;
        mockedAxiosGet.mockResolvedValue(result);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            vaultName,
            refreshToken: "hksall",
            expirationTime: Time.now().toSeconds() + 500,
            importComments: {
              enable: true,
              format: "json",
            },
          },
        });
        expect(importedNotes[0].body).toMatchSnapshot();
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("Import Comments in Markdown as text", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const response = {
          fname: "gdoc.meet",
          custom: {
            documentId: "sjkakauwu",
            revisionId: "ALm37BXFqAKco_",
          },
          body: text,
        };
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        pod.getDataFromGDoc = vi.fn().mockReturnValue(response);
        const mockedAxiosGet = vi.mocked(axios.get);
        result = comments;
        mockedAxiosGet.mockResolvedValue(result);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "emeiice",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
            importComments: {
              enable: true,
              format: "text",
            },
          },
        });
        expect(importedNotes[0].body).toMatchSnapshot();
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("confirmOverwrite to false", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxiosGet = vi.mocked(axios.get);
        result = response;
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        mockedAxiosGet.mockResolvedValue(result);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "akSAal",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
            confirmOverwrite: false,
          },
        });
        expect(importedNotes).toHaveLength(1);
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });
  test("with same revision ID of notes", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxiosGet = vi.mocked(axios.get);
        result = response;
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        await engine.writeNote(existingNote);
        mockedAxiosGet.mockResolvedValue(result);
        await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "LalaLAL",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
          },
        });

        expect.assertions(1);
        return expect(window.showInformationMessage).toHaveBeenCalledWith(
          "Note is already in sync with the google doc"
        );
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("with confirmOverwrite true and selecting cancel from prompt", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxiosGet = vi.mocked(axios.get);
        result = response;
        existingNote.custom.revisionId = "jslkdhsal";
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        await engine.writeNote(existingNote);
        mockedAxiosGet.mockResolvedValue(result);
        stubWindow(undefined);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "hjsjisw",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
          },
        });
        return expect(importedNotes).toEqual([]);
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("with confirmOverwrite true and selecting Yes from prompt", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxios = vi.mocked(axios.get);
        result = response;
        existingNote.custom.revisionId = "jslkdhsa";
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        await engine.writeNote(existingNote);
        mockedAxios.mockResolvedValue(result);
        const resp = {
          title: "Yes",
        };
        stubWindow(resp);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "kqSLA",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
          },
        });
        expect.assertions(1);
        expect(importedNotes).toHaveLength(1);
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });

  test("documents containing an image", async () => {
    await runEngineTestV5(
      async ({ engine, vaults, wsRoot }) => {
        const pod = new GDocImportPod();
        PodUtils.downloadImage = vitest
          .fn()
          .mockReturnValue(`${text}![image](assets/image.png)`);
        pod.getAllDocuments = vi.fn().mockReturnValue({ docIdsHashMap });
        const vaultName = VaultUtils.getName(vaults[0]);
        const mockedAxiosGet = vi.mocked(axios.get);
        result = response;
        mockedAxiosGet.mockResolvedValue(result);
        const { importedNotes } = await pod.execute({
          engine,
          vaults,
          wsRoot,
          utilityMethods,
          onPrompt,
          config: {
            src: "foo",
            accessToken: "xyzabcd",
            refreshToken: "dhdjdjs",
            expirationTime: Time.now().toSeconds() + 500,
            vaultName,
          },
        });
        expect(importedNotes[0].body).toMatch(
          `\n\n## Testing GDoc Pod\n\nThis is the first line\n\n![image](assets/image.png)`
        );
      },
      {
        expect,
        preSetupHook: ENGINE_HOOKS.setupBasic,
      }
    );
  });
});
