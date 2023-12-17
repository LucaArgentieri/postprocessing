import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	// GaussianBlurPass,
	GeometryPass,
	// KawaseBlurPass,
	KernelSize,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, createFPSGraph, getSkyboxUrls } from "../utils/index.js";
import * as CornellBox from "../objects/CornellBox.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(getSkyboxUrls("sunset"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

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

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky") as Texture;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	/*
	const gaussianBlurPass = new GaussianBlurPass({ resolutionScale: 0.5, kernelSize: 35 });
	const kawaseBlurPass = new KawaseBlurPass({ resolutionScale: 0.5, kernelSize: KernelSize.MEDIUM });

	gaussianBlurPass.renderToScreen = true;
	kawaseBlurPass.renderToScreen = true;
	kawaseBlurPass.enabled = false;

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(gaussianBlurPass);
	pipeline.addPass(kawaseBlurPass);
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.registerPlugin(EssentialsPlugin);
	const fpsGraph = createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	const tab = folder.addTab({
		pages: [
			{ title: "Gaussian" },
			{ title: "Kawase" }
		]
	});

	/*
	tab.on("select", (event) => {

		gaussianBlurPass.enabled = (event.index === 0);
		kawaseBlurPass.enabled = (event.index === 1);

	});

	tab.pages[0].addBinding(gaussianBlurPass.blurMaterial, "kernelSize", {
		options: {
			"7x7": 7,
			"15x15": 15,
			"25x25": 25,
			"35x35": 35,
			"63x63": 63,
			"127x127": 127,
			"255x255": 255
		}
	});

	tab.pages[0].addBinding(gaussianBlurPass.blurMaterial, "scale", { min: 0, max: 2, step: 0.01 });
	tab.pages[0].addBinding(gaussianBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });
	tab.pages[0].addBinding(gaussianBlurPass, "iterations", { min: 1, max: 8, step: 1 });

	tab.pages[1].addBinding(kawaseBlurPass.blurMaterial, "kernelSize", { options: KernelSize });
	tab.pages[1].addBinding(kawaseBlurPass.blurMaterial, "scale", { min: 0, max: 2, step: 0.01 });
	tab.pages[1].addBinding(kawaseBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });
	*/

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		// pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		// pipeline.render(timestamp);
		fpsGraph.end();
		requestAnimationFrame(render);

	});

}));
