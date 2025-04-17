import { SeedService } from "@dendronhq/engine-server";
import { fake, replace } from "sinon";
import { SeedAddCommand } from "../../commands/SeedAddCommand";
import { SeedRemoveCommand } from "../../commands/SeedRemoveCommand";

export class PluginTestSeedUtils {
  static getFakedAddCommand(svc: SeedService) {
    const cmd = new SeedAddCommand(svc);

    const fakedOnUpdating = fake.resolves(null);
    const fakedOnUpdated = fake.resolves(null);

    replace(cmd, <any>"onUpdatingWorkspace", fakedOnUpdating);
    replace(cmd, <any>"onUpdatedWorkspace", fakedOnUpdated);

    return { cmd, fakedOnUpdating, fakedOnUpdated };
  }

  static getFakedRemoveCommand(svc: SeedService) {
    const cmd = new SeedRemoveCommand(svc);

    const fakedOnUpdating = fake.resolves(null);
    const fakedOnUpdated = fake.resolves(null);

    replace(cmd, <any>"onUpdatingWorkspace", fakedOnUpdating);
    replace(cmd, <any>"onUpdatedWorkspace", fakedOnUpdated);

    return { cmd, fakedOnUpdating, fakedOnUpdated };
  }
}
