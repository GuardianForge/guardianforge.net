import { BungieApiService, BungieAuthService, InventoryManager, ManifestService } from "../data-utils/Main";
import AlgoliaService from "../../src/services/AlgoliaService";
import GuardianForgeApiService from "../../src/services/GuardianForgeApiService";
import GuardianForgeClientService from "../../src/services/GuardianForgeClientService";

type ServiceCollection = {
	InventoryManager: InventoryManager
	ForgeClient: GuardianForgeClientService
	BungieAuthService: BungieAuthService
	BungieApiService: BungieApiService
	ForgeApiService: GuardianForgeApiService
	AlgoliaService: AlgoliaService
	ManifestService: ManifestService
}

declare global {
	interface Window {
		services: ServiceCollection;
		adsbygoogle: any;
		gtag: any;
		dataLayer: any;
	}
}