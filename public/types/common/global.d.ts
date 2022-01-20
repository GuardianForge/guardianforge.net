import { BungieApiService, InventoryManager, ManifestService } from "@guardianforge/destiny-data-utils";
import AlgoliaService from "../../src/services/AlgoliaService";
import GuardianForgeApiService from "../../src/services/GuardianForgeApiService";
import GuardianForgeClientService from "../../src/services/GuardianForgeClientService";

type ServiceCollection = {
	InventoryManager: InventoryManager
	ForgeClient: GuardianForgeClientService
	BungieApiService: BungieApiService
	ForgeApiService: GuardianForgeApiService
	AlgoliaService: AlgoliaService
	ManifestService: ManifestService
}

declare global {
	interface Window {
		services: ServiceCollection;
	}
}