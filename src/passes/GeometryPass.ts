import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	HalfFloatType,
	LinearFilter,
	Material,
	Mesh,
	NearestFilter,
	NoColorSpace,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	RGBAFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	UnsignedIntType,
	WebGLProgramParametersWithUniforms,
	WebGLRenderTarget,
	WebGLRenderer
} from "three";

import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { GBuffer } from "../enums/GBuffer.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferConfig } from "../utils/GBufferConfig.js";
import { extractIndices, extractOutputDefinitions } from "../utils/GBufferUtils.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { Selection } from "../utils/Selection.js";
import { CopyPass } from "./CopyPass.js";
import { GBufferTextureConfig } from "../utils/GBufferTextureConfig.js";
import { RenderTargetResource } from "../core/index.js";

/**
 * GeometryPass constructor options.
 *
 * @category Passes
 */

export interface GeometryPassOptions {

	/**
	 * Determines whether a stencil buffer should be created.
	 *
	 * @defaultValue false
	 */

	stencilBuffer?: boolean;

	/**
	 * Determines whether a depth buffer should be created.
	 *
	 * @defaultValue true
	 */

	depthBuffer?: boolean;

	/**
	 * The type of the color buffer.
	 *
	 * @defaultValue UnsignedByteType
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA.
	 *
	 * @defaultValue 0
	 */

	samples?: MSAASamples;

	/**
	 * A custom G-Buffer configuration.
	 */

	gBufferConfig?: GBufferConfig;

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements Selective {

	readonly selection: Selection;

	/**
	 * A listener for `childadded` events dispatched by the scene.
	 */

	private readonly onChildAdded: (event: { child: Object3D | null }) => void;

	/**
	 * A listener for `childremoved` events dispatched by the scene.
	 */

	private readonly onChildRemoved: (event: { child: Object3D | null }) => void;

	/**
	 * The G-Buffer configuration.
	 */

	readonly gBufferConfig: GBufferConfig;

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private readonly registeredMaterials: WeakSet<Material>;

	/**
	 * A pass that copies the default input buffer to the output color buffer.
	 */

	private readonly copyPass: CopyPass;

	/**
	 * Controls which G-Buffer components should be rendered by this pass.
	 *
	 * This will automatically be configured based on the requirements of other passes in the same pipeline.
	 *
	 * @internal
	 */

	readonly gBufferComponents: Set<GBuffer | string>;

	// #region Settings

	/**
	 * Indicates whether a stencil buffer should be created.
	 */

	readonly stencilBuffer: boolean;

	/**
	 * Indicates whether a depth buffer should be created.
	 */

	readonly depthBuffer: boolean;

	/**
	 * The texture data type of the primary color buffer.
	 */

	readonly frameBufferType: TextureDataType;

	/**
	 * A resource that wraps the G-Buffer.
	 */

	private readonly gBufferResource: RenderTargetResource;

	/**
	 * @see {@link samples}
	 */

	private _samples: MSAASamples;

	// #endregion

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - A scene.
	 * @param camera - A camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene, camera: OrthographicCamera | PerspectiveCamera, {
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = UnsignedByteType,
		samples = 0,
		gBufferConfig = new GBufferConfig()
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.onChildAdded = (event: { child: Object3D | null }) => {

			event.child?.traverse((node) => {

				node.addEventListener("childadded", this.onChildAdded);
				node.addEventListener("childremoved", this.onChildRemoved);
				this.updateMaterial(node);

			});

		};

		this.onChildRemoved = (event: { child: Object3D | null }) => {

			event.child?.traverse((node) => {

				node.removeEventListener("childadded", this.onChildAdded);
				node.removeEventListener("childremoved", this.onChildRemoved);

			});

		};

		this.stencilBuffer = stencilBuffer;
		this.depthBuffer = depthBuffer;
		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.gBufferConfig = gBufferConfig;
		this.registeredMaterials = new WeakSet<Material>();
		this.copyPass = new CopyPass();
		this.copyPass.enabled = false;
		this.subpasses = [this.copyPass];

		const gBufferComponents = new ObservableSet<GBuffer | string>();
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.gBufferResource = new RenderTargetResource();
		this.output.defaultBuffer = this.gBufferResource;

		this.scene = scene;
		this.camera = camera;

		this.updateTextureConfigs();
		this.updateGBuffer();

	}

	override get scene(): Scene | null {

		return super.scene;

	}

	override set scene(value: Scene | null) {

		this.onChildRemoved({ child: this.scene });
		super.scene = value;
		this.onChildAdded({ child: value });

	}

	/**
	 * Sets the amount of MSAA samples.
	 */

	get samples(): MSAASamples {

		return this._samples;

	}

	set samples(value: MSAASamples) {

		this._samples = value;

		const buffer = this.output.defaultBuffer?.value ?? null;

		if(buffer !== null && buffer.samples !== value) {

			buffer.samples = value;
			buffer.dispose();

		}

	}

	/**
	 * Returns the G-Buffer render target, or null if this pass renders to screen.
	 */

	get gBuffer(): WebGLRenderTarget | null {

		return this.gBufferResource.value;

	}

	/**
	 * Returns the G-Buffer texture configs that correspond to the current G-Buffer components.
	 */

	private get textureConfigs(): [string, GBufferTextureConfig][] {

		return Array.from(this.gBufferConfig.textureConfigs).filter(x => this.gBufferComponents.has(x[0]));

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;
		this.updateOutputBufferColorSpace();

	}

	/**
	 * Defines the primary G-Buffer texture configs.
	 */

	private updateTextureConfigs(): void {

		const textureConfigs = this.gBufferConfig.textureConfigs;

		textureConfigs.set(GBuffer.COLOR, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: this.frameBufferType,
			format: RGBAFormat,
			isColorBuffer: true
		});

		textureConfigs.set(GBuffer.NORMAL, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			format: RGBAFormat,
			isColorBuffer: false
		});

		textureConfigs.set(GBuffer.ORM, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: UnsignedByteType,
			format: RGBAFormat,
			isColorBuffer: false
		});

		textureConfigs.set(GBuffer.EMISSION, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: this.frameBufferType,
			format: RGBAFormat,
			isColorBuffer: true
		});

	}

	/**
	 * Enables rendering to {@link GBuffer} components for the materials of a given mesh.
	 *
	 * Should be called when a material is added, removed or replaced at runtime.
	 *
	 * TODO Remove when `three` supports output layout definitions for MRT.
	 *
	 * @param object - The object to update.
	 */

	private updateMaterial(object: Object3D | null): void {

		if(!(object instanceof Mesh)) {

			return;

		}

		const mesh = object as Mesh;

		for(const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {

			if(this.registeredMaterials.has(material)) {

				return;

			}

			this.registeredMaterials.add(material);

			/* eslint-disable @typescript-eslint/unbound-method */
			const onBeforeCompile = material.onBeforeCompile;

			material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

				// Workaround for troika-three-text, see #660.
				if(material.onBeforeCompile !== onBeforeCompile) {

					onBeforeCompile.call(material, shader, renderer);

				}

				if(this.gBuffer === null) {

					return;

				}

				const outputDefinitions = extractOutputDefinitions(this.gBuffer);
				shader.fragmentShader = outputDefinitions + "\n\n" + shader.fragmentShader;

			};

		}

	}

	/**
	 * Updates the color space of the output buffers.
	 */

	private updateOutputBufferColorSpace(): void {

		const gBuffer = this.gBuffer;
		const renderer = this.renderer;

		if(gBuffer === null || renderer === null) {

			return;

		}

		const indices = extractIndices(gBuffer);
		const useSRGB = (this.frameBufferType === UnsignedByteType && renderer.outputColorSpace === SRGBColorSpace);
		const colorSpace = useSRGB ? SRGBColorSpace : NoColorSpace;

		for(const entry of this.textureConfigs) {

			if(entry[1].isColorBuffer && indices.has(entry[0])) {

				const index = indices.get(entry[0])!;
				gBuffer.textures[index].colorSpace = colorSpace;

			}

		}

	}

	/**
	 * Updates the G-Buffer configuration.
	 */

	private updateGBuffer(): void {

		const output = this.output;
		const gBufferComponents = this.gBufferComponents;

		if(output.hasDefaultBuffer && output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		} else if(!output.hasDefaultBuffer) {

			output.defaultBuffer = this.gBufferResource;

		}

		// Dispose the current G-Buffer if it exists.
		output.defaultBuffer!.value?.depthTexture?.dispose();
		output.defaultBuffer!.value?.dispose();

		if(gBufferComponents.size === 0) {

			// Fall back to the canvas.
			output.defaultBuffer = null;
			output.defines.clear();
			return;

		}

		// Create a new G-Buffer.
		const { width, height } = this.resolution;
		const textureConfigs = this.textureConfigs;
		const renderTarget = new WebGLRenderTarget(width, height, {
			stencilBuffer: this.stencilBuffer,
			depthBuffer: this.depthBuffer,
			samples: this.samples,
			count: textureConfigs.length
		});

		for(let i = 0, l = textureConfigs.length; i < l; ++i) {

			const entry = textureConfigs[i];
			const texture = renderTarget.textures[i];
			const textureConfig = entry[1];
			texture.name = entry[0];
			texture.minFilter = textureConfig.minFilter;
			texture.magFilter = textureConfig.magFilter;
			texture.format = textureConfig.format;
			texture.type = textureConfig.type;

		}

		output.defaultBuffer = renderTarget;
		this.configureDepthTexture();
		this.updateOutputBufferColorSpace();

	}

	/**
	 * Configures the depth texture.
	 *
	 * Uses the current {@link GBuffer.DEPTH} texture if available, or creates a new one.
	 */

	private configureDepthTexture(): void {

		const output = this.output;

		if(output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		}

		const outputBuffer = output.defaultBuffer.value;

		if(outputBuffer === null) {

			return;

		}

		if(!this.gBufferComponents.has(GBuffer.DEPTH)) {

			outputBuffer.depthTexture?.dispose();
			outputBuffer.depthTexture = null;
			return;

		}

		const inputDepthTexture = this.input.getBuffer(GBuffer.DEPTH);

		if(inputDepthTexture !== null) {

			if(outputBuffer.depthTexture !== inputDepthTexture) {

				outputBuffer.depthTexture?.dispose();
				outputBuffer.depthTexture = inputDepthTexture as DepthTexture;

			}

		} else {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.name = GBuffer.DEPTH;
			depthTexture.format = this.stencilBuffer ? DepthStencilFormat : DepthFormat;
			depthTexture.type = this.stencilBuffer ? UnsignedInt248Type : UnsignedIntType;
			outputBuffer.depthTexture?.dispose();
			outputBuffer.depthTexture = depthTexture;

		}

	}

	/**
	 * Updates the settings of the internal copy pass.
	 */

	private updateCopyPass(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;
		const inputIsOutput = (inputBuffer === outputBuffer?.texture);
		const outputIsMRT = ((outputBuffer?.textures.length ?? 0) > 1);

		this.copyPass.enabled = (inputBuffer !== null && !inputIsOutput && !outputIsMRT);

	}

	protected override onInputChange(): void {

		this.configureDepthTexture();

		const copyPass = this.copyPass;
		copyPass.input.defaultBuffer = this.input.defaultBuffer;
		this.updateCopyPass();

		if(this.input.buffers.has(GBuffer.DEPTH)) {

			copyPass.input.buffers.set(GBuffer.DEPTH, this.input.buffers.get(GBuffer.DEPTH)!);

		} else {

			copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

	}

	protected override onOutputChange(): void {

		if(!this.output.hasDefaultBuffer) {

			// Restore the G-Buffer.
			this.updateGBuffer();

		} else {

			this.configureDepthTexture();

		}

		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;
		this.updateCopyPass();

	}

	protected override onResolutionChange(): void {

		// Use the same resolution settings for the copy pass.
		this.copyPass.resolution.copy(this.resolution);

	}

	override render(): void {

		const { renderer, scene, camera } = this;

		if(renderer === null || scene === null || camera === null) {

			return;

		}

		const mask = camera.layers.mask;
		const background = scene.background;

		// The background is rendered by the ClearPass, if present.
		scene.background = null;

		if(this.selection.enabled) {

			camera.layers.set(this.selection.layer);

		}

		if(this.copyPass.enabled) {

			this.copyPass.render();

		}

		this.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		renderer.render(scene, camera);

		// Restore the original values.
		camera.layers.mask = mask;
		scene.background = background;

	}

}
