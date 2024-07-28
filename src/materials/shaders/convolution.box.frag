#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

#ifdef BILATERAL

	#include <pp_camera_pars_fragment>

	#ifdef NORMAL_DEPTH

		#ifdef GL_FRAGMENT_PRECISION_HIGH

			uniform highp sampler2D normalDepthBuffer;

		#else

			uniform mediump sampler2D normalDepthBuffer;

		#endif

		#define getDepth(uv) texture(normalDepthBuffer, uv).a

	#else

		#include <pp_depth_buffer_pars_fragment>
		#define getDepth(uv) texture(depthBuffer, uv).r

	#endif

	#include <packing>

	#ifdef PERSPECTIVE_CAMERA

		#define getViewZ(depth) perspectiveDepthToViewZ(depth, cameraParams.x, cameraParams.y)
		#define linearDepth(uv) viewZToOrthographicDepth(getViewZ(getDepth(uv)), cameraParams.x, cameraParams.y)

	#else

		#define getViewZ(depth) orthographicDepthToViewZ(depth, cameraParams.x, cameraParams.y)
		#define linearDepth(uv) getDepth(uv)

	#endif

#endif

#define getTexel(uv) texture(inputBuffer, uv)

#if KERNEL_SIZE == 3

	// Optimized 3x3
	in vec2 vUv00, vUv01, vUv02;
	in vec2 vUv03, vUv04, vUv05;
	in vec2 vUv06, vUv07, vUv08;

#elif KERNEL_SIZE == 5 && MAX_VARYING_VECTORS >= 13

	// Optimized 5x5
	in vec2 vUv00, vUv01, vUv02, vUv03, vUv04;
	in vec2 vUv05, vUv06, vUv07, vUv08, vUv09;
	in vec2 vUv10, vUv11, vUv12, vUv13, vUv14;
	in vec2 vUv15, vUv16, vUv17, vUv18, vUv19;
	in vec2 vUv20, vUv21, vUv22, vUv23, vUv24;

#else

	// General case
	#include <pp_resolution_pars_fragment>
	uniform float scale;
	in vec2 vUv;

#endif

void main() {

	#if KERNEL_SIZE == 3

		// Optimized 3x3
		vec4 c[] = vec4[KERNEL_SIZE_SQ](
			getTexel(vUv00), getTexel(vUv01), getTexel(vUv02),
			getTexel(vUv03), getTexel(vUv04), getTexel(vUv05),
			getTexel(vUv06), getTexel(vUv07), getTexel(vUv08)
		);

		#ifdef BILATERAL

			float z[] = float[KERNEL_SIZE_SQ](
				linearDepth(vUv00), linearDepth(vUv01), linearDepth(vUv02),
				linearDepth(vUv03), linearDepth(vUv04), linearDepth(vUv05),
				linearDepth(vUv06), linearDepth(vUv07), linearDepth(vUv08)
			);

		#endif

	#elif KERNEL_SIZE == 5 && MAX_VARYING_VECTORS >= 13

		// Optimized 5x5
		vec4 c[] = vec4[KERNEL_SIZE_SQ](
			getTexel(vUv00), getTexel(vUv01), getTexel(vUv02), getTexel(vUv03), getTexel(vUv04),
			getTexel(vUv05), getTexel(vUv06), getTexel(vUv07), getTexel(vUv08), getTexel(vUv09),
			getTexel(vUv10), getTexel(vUv11), getTexel(vUv12), getTexel(vUv13), getTexel(vUv14),
			getTexel(vUv15), getTexel(vUv16), getTexel(vUv17), getTexel(vUv18), getTexel(vUv19),
			getTexel(vUv20), getTexel(vUv21), getTexel(vUv22), getTexel(vUv23), getTexel(vUv24)
		);

		#ifdef BILATERAL

			float z[] = float[KERNEL_SIZE_SQ](
				linearDepth(vUv00), linearDepth(vUv01), linearDepth(vUv02), linearDepth(vUv03), linearDepth(vUv04),
				linearDepth(vUv05), linearDepth(vUv06), linearDepth(vUv07), linearDepth(vUv08), linearDepth(vUv09),
				linearDepth(vUv10), linearDepth(vUv11), linearDepth(vUv12), linearDepth(vUv13), linearDepth(vUv14),
				linearDepth(vUv15), linearDepth(vUv16), linearDepth(vUv17), linearDepth(vUv18), linearDepth(vUv19),
				linearDepth(vUv20), linearDepth(vUv21), linearDepth(vUv22), linearDepth(vUv23), linearDepth(vUv24)
			);

		#endif

	#endif

	vec4 result = vec4(0.0);

	#ifdef BILATERAL

		float w = 0.0;

		#if KERNEL_SIZE == 3 || (KERNEL_SIZE == 5 && MAX_VARYING_VECTORS >= 13)

			// Optimized 3x3 or 5x5
			float centerDepth = z[KERNEL_SIZE_SQ_HALF];

			for(int i = 0; i < KERNEL_SIZE_SQ; ++i) {

				float d = step(abs(z[i] - centerDepth), DISTANCE_THRESHOLD);
				result += c[i] * d;
				w += d;

			}

		#else

			// General case
			float centerDepth = linearDepth(vUv);
			vec2 s = resolution.zw * scale;

			for(int x = -KERNEL_SIZE_HALF; x <= KERNEL_SIZE_HALF; ++x) {

				for(int y = -KERNEL_SIZE_HALF; y <= KERNEL_SIZE_HALF; ++y) {

					vec2 coords = vUv + vec2(x, y) * s;
					vec4 c = getTexel(coords);
					float z = (x == 0 && y == 0) ? centerDepth : linearDepth(coords);

					float d = step(abs(z - centerDepth), DISTANCE_THRESHOLD);
					result += c * d;
					w += d;

				}

			}

		#endif

		out_Color = result / max(w, 1.0);

	#else

		#if KERNEL_SIZE == 3 || (KERNEL_SIZE == 5 && MAX_VARYING_VECTORS >= 13)

			// Optimized 3x3 or 5x5
			for(int i = 0; i < KERNEL_SIZE_SQ; ++i) {

				result += c[i];

			}

		#else

			// General case
			vec2 s = resolution.zw * scale;

			for(int x = -KERNEL_SIZE_HALF; x <= KERNEL_SIZE_HALF; ++x) {

				for(int y = -KERNEL_SIZE_HALF; y <= KERNEL_SIZE_HALF; ++y) {

					result += getTexel(uv + vec2(x, y) * s);

				}

			}

		#endif

		out_Color = result * INV_KERNEL_SIZE_SQ;

	#endif

}
