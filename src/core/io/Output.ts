import { EventDispatcher, Uniform, UnsignedByteType, WebGLMultipleRenderTargets, WebGLRenderTarget } from "three";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { ShaderData } from "../ShaderData.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { Resource } from "./Resource.js";

/**
 * Output resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category Core
 */

export class Output extends EventDispatcher<BaseEventMap> implements ShaderData {

	/**
	 * Triggers when an output resource is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, Uniform>;

	/**
	 * Output render targets.
	 */

	readonly renderTargets: Map<string, RenderTargetResource>;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, Uniform>();
		const renderTargets = new ObservableMap<string, RenderTargetResource>();

		const listener = () => this.dispatchEvent({ type: Output.EVENT_CHANGE });
		defines.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		renderTargets.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		renderTargets.addEventListener(ObservableMap.EVENT_ADD,
			(e) => e.value.addEventListener(Resource.EVENT_CHANGE, listener));
		renderTargets.addEventListener(ObservableMap.EVENT_DELETE,
			(e) => e.value.removeEventListener(Resource.EVENT_CHANGE, listener));

		this.defines = defines;
		this.uniforms = uniforms;
		this.renderTargets = renderTargets;

	}

	/**
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): Map<string, RenderTargetResource> {

		return this.renderTargets;

	}

	/**
	 * The default output buffer.
	 */

	get defaultBuffer(): RenderTargetResource | null {

		return this.renderTargets.get(Output.BUFFER_DEFAULT) ?? null;

	}

	set defaultBuffer(value: RenderTargetResource | WebGLRenderTarget | WebGLMultipleRenderTargets | null) {

		if(value instanceof RenderTargetResource) {

			if(this.renderTargets.get(Output.BUFFER_DEFAULT) !== value) {

				this.renderTargets.set(Output.BUFFER_DEFAULT, value);

			}

		} else {

			const resource = this.defaultBuffer;

			if(resource !== null) {

				resource.value = value;

			} else {

				this.renderTargets.set(Output.BUFFER_DEFAULT, new RenderTargetResource(value));

			}

		}

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		const outputBuffer = this.defaultBuffer?.value;

		if(outputBuffer === undefined || outputBuffer === null) {

			return false;

		}

		// Assuming index 0 is the albedo attachment.
		const type = outputBuffer instanceof WebGLMultipleRenderTargets ?
			outputBuffer.texture[0].type :
			outputBuffer.texture.type;

		return type !== UnsignedByteType;

	}

}
