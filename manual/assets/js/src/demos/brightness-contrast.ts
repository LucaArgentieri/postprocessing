import {
	LoadingManager,
	PerspectiveCamera,
	PlaneGeometry,
	Mesh,
	MeshBasicMaterial,
	Scene,
	TextureLoader,
	WebGLRenderer,
	Texture,
	SRGBColorSpace,
	HalfFloatType
} from "three";

import {
	ClearPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		textureLoader.load(`${document.baseURI}img/textures/photos/GEDC0053.jpg`, (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("photo", t);

		});

	});

}

window.addEventListener("load", () => void load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.debug.checkShaderErrors = Utils.isLocalhost;
	renderer.setClearAlpha(0);

	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.zoom.sensitivity = 0.05;
	settings.zoom.damping = 0.1;
	settings.rotation.sensitivity = 0;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 1.4);

	// Scene & Objects

	const scene = new Scene();
	const mesh = new Mesh(
		new PlaneGeometry(),
		new MeshBasicMaterial({
			map: assets.get("photo") as Texture
		})
	);

	mesh.scale.x = 2;
	scene.add(mesh);

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new ClearPass());
	pipeline.addPass(new GeometryPass(scene, camera, {
		frameBufferType: HalfFloatType
	}));

	/*
	const effect = new BrightnessContrastEffect();
	effect.blendMode.blendFunction = new MixBlendFunction();
	pipeline.addPass(new EffectPass(effect, new ToneMappingEffect()));
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "brightness", { min: -1, max: 1, step: 1e-4 });
	folder.addBinding(effect, "contrast", { min: -1, max: 1, step: 1e-4 });

	Utils.addBlendModeBindings(folder, effect.blendMode);
	*/

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

		requestAnimationFrame(render);

	});

}));
