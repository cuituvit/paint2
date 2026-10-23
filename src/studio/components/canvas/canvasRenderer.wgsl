


struct VertexOutput {
    @builtin(position) _pos: vec4f,
    @location(0) uv:        vec2f,
    @location(1) world_pos:  vec2f,
}

struct SharedUniforms {
    proj: mat4x4f,
};

struct Uniforms {
    pos: vec2i,
    scale: vec2i,
};

@group(0) @binding(0) var<uniform> shareduniforms: SharedUniforms;
@group(0) @binding(1) var<uniform> uniforms:       Uniforms;

@group(0) @binding(2) var mysampler: sampler;
@group(0) @binding(3) var texture:   texture_2d<f32>;

@vertex
fn vmain(@builtin(vertex_index) _id: u32) -> VertexOutput {
    const _pos = array<vec2f, 6>(
        vec2f(0, 0), vec2f(1, 0), vec2f(0, 1),
        vec2f(0, 1), vec2f(1, 0), vec2f(1, 1)
    );
    const _uvs     = _pos;
    let _world_pos = _pos[_id] * vec2f(uniforms.scale) + vec2f(uniforms.pos);

    var _out: VertexOutput;
    _out._pos 
        = shareduniforms.proj
        * vec4f(
            _world_pos, 0, 1
        );

    _out.uv        = _uvs[_id];
    _out.world_pos = _world_pos;
    return _out;
}

@fragment
fn fmain(@location(0) _uv: vec2f) -> @location(0) vec4f {
    return textureSample(texture, mysampler, _uv);
}

@fragment
fn fmain_grid(_in: VertexOutput) -> @location(0) vec4f {
    const _tile_size = 16.;
    let _grid        = floor(_in.world_pos / _tile_size);
    let _check       = (i32(_grid.x) + i32(_grid.y)) % 2;
    return mix(vec4f(.085, .085, .085, 1), vec4f(.115, .115, .115, 1), f32(_check));
}