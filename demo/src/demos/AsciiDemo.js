import { Color, PerspectiveCamera } from "three";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
    EdgeDetectionMode,
    EffectPass,
    AsciiEffect,
    SMAAEffect,
    SMAAImageLoader,
    SMAAPreset
} from "../../../src";

/**
 * Ascii demo.
 */

export class AsciiDemo extends PostProcessingDemo {

    /**
     * Constructs a new ascii demo.
     *
     * @param {EffectComposer} composer - An effect composer.
     */

    constructor(composer) {

        super("ascii", composer);

        /**
         * An effect.
         *
         * @type {Effect}
         * @private
         */

        this.effect = null;

    }

    load() {

        const assets = this.assets;
        const loadingManager = this.loadingManager;
        const smaaImageLoader = new SMAAImageLoader(loadingManager);

        const anisotropy = Math.min(this.composer.getRenderer()
            .capabilities.getMaxAnisotropy(), 8);

        return new Promise((resolve, reject) => {

            if (assets.size === 0) {

                loadingManager.onLoad = () => setTimeout(resolve, 250);
                loadingManager.onProgress = ProgressManager.updateProgress;
                loadingManager.onError = url => console.error(`Failed to load ${url}`);

                Sponza.load(assets, loadingManager, anisotropy);

                smaaImageLoader.load(([search, area]) => {

                    assets.set("smaa-search", search);
                    assets.set("smaa-area", area);

                });

            } else {

                resolve();

            }

        });

    }

    initialize() {

        const scene = this.scene;
        const assets = this.assets;
        const composer = this.composer;
        const renderer = composer.getRenderer();
        const domElement = renderer.domElement;

        // Camera

        const aspect = window.innerWidth / window.innerHeight;
        const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
        const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
        this.camera = camera;

        // Controls

        const { position, quaternion } = camera;
        const controls = new SpatialControls(position, quaternion, domElement);
        const settings = controls.settings;
        settings.rotation.sensitivity = 2.2;
        settings.rotation.damping = 0.05;
        settings.translation.sensitivity = 3.0;
        settings.translation.damping = 0.1;
        controls.position.set(-9, 0.5, 0);
        controls.lookAt(0, 3, -3.5);
        this.controls = controls;

        // Sky

        scene.background = new Color(0xeeeeee);

        // Lights

        scene.add(...Sponza.createLights());

        // Objects

        scene.add(assets.get(Sponza.tag));

        // Passes

        const smaaEffect = new SMAAEffect(
            assets.get("smaa-search"),
            assets.get("smaa-area"),
            SMAAPreset.HIGH,
            EdgeDetectionMode.DEPTH
        );

        smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

        const asciiEffect = new AsciiEffect({
            fontSize: 35,
            cellSize: 16,
            invert: false,
            color: "#ffffff",
            characters: ` .:,'-^=*+?!|0#X%WM@`
        });

        const effectPass = new EffectPass(camera, asciiEffect);
        // const smaaPass = new EffectPass(camera, smaaEffect);

        this.effect = asciiEffect;

        // composer.addPass(smaaPass);
        composer.addPass(effectPass);

    }

    registerOptions(menu) {

        const effect = this.effect;

        const params = {
            font: "arial",
            characters: ` .:,'-^=*+?!|0#X%WM@`,
            fontSize: 54,
            cellSize: 16,
            color: "#ffffff",
            invert: false
        };

        // menu.add(params, "fontSize", 0, 50, 1).onChange((value) => {
        //     effect.fontSize = value;
        // });

        // menu.add(params, "cellSize", 1, 32, 1).onChange((value) => {
        //     effect.cellSize = value;
        // });

        // menu.addColor(params, "color").onChange((value) => {
        //     effect.color = value;
        // });

        // menu.add(params, "invert").onChange((value) => {
        //     effect.invert = value;
        // });

        if (window.innerWidth < 720) {
            menu.close();

        }

    }

}
